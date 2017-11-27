const express = require('express');
const bodyParser = require('body-parser');

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
    if(!docs){
      res.status(404).send();
    }
    res.send({todo});
  },(err)=>{
    red.status(400).send();
  }).catch((err)=>{
    res.status(400).send();
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
  },(err)=>{
    res.status(400).send();
  }).catch((err)=>{
    res.status(400).send();
  });
});

app.listen(port,()=>{
  console.log(`started Todo API on port ${port}`);
});

module.exports = {app};
