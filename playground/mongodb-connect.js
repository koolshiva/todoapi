const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb');
MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,db)=>{
  if(err){
    return console.log("Unable to connect to TodoApp Mongo DB.");
  }
  console.log("Connect to TodoApp Mongo DB server.");

  db.collection('Todos').insertOne({
    text:"Something to do",
    completed:false
  },(err,res)=>{
    if(err){
      return console.log("Unable to create the document.",err);
    }
    console.log(JSON.stringify(res.ops,undefined,2));
  });

  // db.collection('Users').insertOne({
  //   name:"shiva",age:32,location:"chennai"
  // },(err,res)=>{
  //   if(err){
  //     console.log("Unable to inser record into Users collection.");
  //   }
  //   console.log(JSON.stringify(res.ops,undefined,2));
  // });
  // db.close();
});
