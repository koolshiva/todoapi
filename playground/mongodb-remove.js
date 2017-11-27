const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb');

var Todo = require("./../server/models/Todo");
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/TodoApp");
var newTodo = Todo.getTodoModel(mongoose);

// newTodo.remove({}).then((results)=>{
//   console.log(results);
// });

// newTodo.findOneAndRemove({}).then(()=>{
//
// });

newTodo.findByIdAndRemove('5a1b8c55e92701cf87c68f15').then((doc)=>{
  console.log(doc);
});
