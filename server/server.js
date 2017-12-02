const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const jwt = require("jsonwebtoken");

require("./config/config.js");
var mongoose = require('./db/mongoose');

var TodoConstruct = require('./models/Todo');
var UserConstruct = require('./models/User');

var app = express();
var port = process.env.PORT || 3000;
app.use(bodyParser.json());

app.post('/todos',(req,res)=>{
  var Todo = TodoConstruct.getTodoModel(mongoose.mongoose);
  var newTodo = new Todo({
    text:req.body.text
  });

  TodoConstruct.saveTodoDocument(newTodo).then((doc)=>{
    res.send(doc);
  },(err)=>{
    res.status(400).send(err);
  });
});

app.get('/todos',(req,res)=>{
  var Todo = TodoConstruct.getTodoModel(mongoose.mongoose);
  Todo.find().then((todos)=>{
    res.send({todos});
  },(err)=>{
    res.status(400).send(err);
  });
});

app.get('/todos/:id',(req,res)=>{
  var id = req.params.id;//5a1a4dd4e92701cf87c688b9
  if(!mongoose.mongoose.Types.ObjectId.isValid(id)){
    res.status(400).send();
  }
  var Todo = TodoConstruct.getTodoModel(mongoose.mongoose);
  Todo.findById(id).then((todo)=>{
    if(!todo){
      res.status(404).send();
    }
    res.send({todo});
  },(err)=>{
    res.status(400).send();
  }).catch((err)=>{
    console.log(req.params.id);
    res.status(400).send(err);
  });
});

app.delete("/todos/:id",(req,res)=>{
  var id = req.params.id;
  if(!mongoose.mongoose.Types.ObjectId.isValid(id)){
    res.status(400).send();
  }
  var Todo = TodoConstruct.getTodoModel(mongoose.mongoose);
  Todo.findByIdAndRemove(id).then((todo)=>{
    if(!todo){
      res.status(404).send();
    }
    res.send({todo});
  }).catch((err)=>{
    res.status(400).send(err);
  });
});

app.patch('/todos/:id',(req,res)=>{
  try{
    var id = req.params.id,
    body = _.pick(req.body,['text','completed']);
    if(!mongoose.mongoose.Types.ObjectId.isValid(id)){
      res.status(400).send();
    }
    if(_.isBoolean(body.completed) && body.completed){
      body.completedAt = new Date().getTime();
    }else{
      body.completed = false;
      body.completedAt = null;
    }
    var newTodo = TodoConstruct.getTodoModel(mongoose.mongoose);
    newTodo.findByIdAndUpdate(id,{$set:body},{new:true}).then((todo)=>{
      if(!todo){
        res.status(404).send();
      }
      res.send({todo});
    }).catch((err)=>{
      res.status(400).send();
    });
  }catch(e){
    console.log(e);
    res.status(434).send({error:"There was a problem at the server in handling your request"});
  }
});

app.post('/users',(req,res)=>{
  var user = _.pick(req.body,['email','password']),token = null;
  var User = UserConstruct.getUserModel(mongoose.mongoose);
  var newUser = new User(user);

  UserConstruct.saveUserDocument(newUser).then(()=>{
    token = newUser.getAuthToken();
    console.log(token);
    newUser.tokens.push(token);
    console.log(newUser);
    return UserConstruct.saveUserDocument(newUser);

  },(err)=>{
    console.log(err);
    res.send(err);
  }).then(()=>{
    //console.log(newUser);
    res.header('x-auth',token.token).send(newUser);
  }).catch((e)=>{
    console.log(e);
    res.send(e);
  });
});

var authenticate = (req,res,next)=>{
  var token = req.header('x-auth');
  var User = UserConstruct.getUserModel(mongoose.mongoose);
  User.findByToken(token).then((user)=>{
    console.log(user);
    if(!user){
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    next();
  }).catch((e)=>{
    //console.log(e);
    res.status(401).send();
  });
};

app.get('/users/me',authenticate,(req,res)=>{
  res.send(req.user);
});

app.listen(port,()=>{
  console.log(`started Todo API on port ${port}`);
});

module.exports = {app};
