const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb');

var Todo = require("./../server/models/Todo");
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/TodoApp");
var newTodo = Todo.getTodoModel(mongoose);

if(!mongoose.Types.ObjectId.isValid('5a1a4dd4e92701cf87c688b9')){
  return console.log("invalid obj id");
}
newTodo.findById('5a1a4dd4e92701cf87c688b9').then((docs)=>{
  if(!docs){
    console.log("invalid docs:",docs);
  }
  console.log("valid docs: ",docs);
},(err)=>{
  console.log("err",err);
});

//mongoose.close();

// MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,db)=>{
//   if(err){
//     return console.log("Unable to connect to TodoApp Mongo DB.");
//   }
//   console.log("Connect to TodoApp Mongo DB server.");
//   db.collection('Todos').find({_id: new ObjectID('5a19128f5bcb855db819de93')}).toArray().then((docs)=>{
//
//     console.log(JSON.stringify(docs));
//   },(err)=>{
//     console.log("Unable to retrieve data.",err);
//   });
  // db.collection('Todos').insertOne({
  //   text:"Something to do",
  //   completed:false
  // },(err,res)=>{
  //   if(err){
  //     return console.log("Unable to create the document.",err);
  //   }
  //   console.log(JSON.stringify(res.ops,undefined,2));
  // });

  // db.collection('Users').insertOne({
  //   name:"shiva",age:32,location:"chennai"
  // },(err,res)=>{
  //   if(err){
  //     console.log("Unable to inser record into Users collection.");
  //   }
  //   console.log(JSON.stringify(res.ops,undefined,2));
  // });
  // db.close();
//});
