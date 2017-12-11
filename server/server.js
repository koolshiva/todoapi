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


var authenticate = (req,res,next)=>{
  var token = req.header('x-auth');
  var User = UserConstruct.getUserModel(mongoose.mongoose);
  User.findByToken(token).then((user)=>{
    if(!user){
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    next();
  }).catch((e)=>{
    res.status(401).send();
  });
};

app.post('/todos',authenticate,(req,res)=>{
  var Todo = TodoConstruct.getTodoModel(mongoose.mongoose);
  var newTodo = new Todo({
    text:req.body.text,
    _creator:req.user._id
  });

  TodoConstruct.saveTodoDocument(newTodo).then((doc)=>{
    res.send(doc);
  },(err)=>{
    res.status(400).send(err);
  });
});

app.get('/todos',authenticate,(req,res)=>{
  var Todo = TodoConstruct.getTodoModel(mongoose.mongoose);
  Todo.find({
    _creator:req.user._id
  }).then((todos)=>{
    res.send({todos});
  },(err)=>{
    res.status(400).send(err);
  });
});

app.get('/todos/:id',authenticate,(req,res)=>{
  var id = req.params.id;//5a1a4dd4e92701cf87c688b9
  if(!mongoose.mongoose.Types.ObjectId.isValid(id)){
    res.status(400).send();
  }
  var Todo = TodoConstruct.getTodoModel(mongoose.mongoose);
  Todo.findOne({
    _id:id,
    _creator:req.user._id
  }).then((todo)=>{
    if(!todo){
      res.status(404).send();
    }
    res.send({todo});
  },(err)=>{
    res.status(400).send();
  }).catch((err)=>{
    res.status(400).send(err);
  });
});

app.delete("/todos/:id",(req,res)=>{
  var id = req.params.id;
  if(!mongoose.mongoose.Types.ObjectId.isValid(id)){
    res.status(400).send();
  }
  var Todo = TodoConstruct.getTodoModel(mongoose.mongoose);
  Todo.findOneAndRemove({
    _id:id,
    _creator:req.user._id
  }).then((todo)=>{
    if(!todo){
      res.status(404).send();
    }
    res.send({todo});
  }).catch((err)=>{
    res.status(400).send(err);
  });
});

app.patch('/todos/:id',authenticate,(req,res)=>{
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
    newTodo.findByOneAndUpdate({
      _id:id,
      _creator:req.user._id
    },{$set:body},{new:true}).then((todo)=>{
      if(!todo){
        res.status(404).send();
      }
      res.send({todo});
    }).catch((err)=>{
      res.status(400).send();
    });
  }catch(e){
    res.status(434).send({error:"There was a problem at the server in handling your request"});
  }
});

app.post('/users',(req,res)=>{
  var user = _.pick(req.body,['email','password']),token = null;
  var User = UserConstruct.getUserModel(mongoose.mongoose);
  var newUser = new User(user);

  UserConstruct.saveUserDocument(newUser).then(()=>{
    return newUser.getAuthToken();
  }).then((token)=>{
    res.header('x-auth',token).send(newUser);
  }).catch((e)=>{
    res.status(400).send(e);
  });
});

app.post('/users/login',(req,res)=>{
  var email = req.body.email, password = req.body.password,token=null;
  var User = UserConstruct.getUserModel(mongoose.mongoose);
  User.findByCredentials(email,password).then((user)=>{
    return user.getAuthToken().then((token)=>{
      res.header('x-auth',token).send(user);
    });
  }).catch((e)=>{
    res.send(e);
  });
});

app.get('/users/me',authenticate,(req,res)=>{
  res.send(req.user);
});

app.delete('/users/me/token',authenticate,(req,res)=>{
  var token = req.token;
  req.user.deleteToken(token).then(()=>{
    res.status(200).send();
  },(err)=>{
    res.status(400).send();
  });
});

app.listen(port,()=>{
  console.log(`started Todo API on port ${port}`);
});

module.exports = {app};
