const mongoose = require('../../db/mongoose');
const TodoConstruct = require('./../../models/Todo');
const UserConstruct = require('./../../models/User');
const jwt = require("jsonwebtoken");
const ObjectID = require('mongodb');
var objectId1 = new mongoose.mongoose.Types.ObjectId();
var objectId2 = new mongoose.mongoose.Types.ObjectId();

var todoTests = [
  {_id: new mongoose.mongoose.Types.ObjectId(),
    text:"todo1"},
  {_id: new mongoose.mongoose.Types.ObjectId(),
    text:"Todo2"}
];

var users = [
  {_id: objectId1,
    email:"abc@123.com",
    password:"abc123",
    tokens:[
      {
        access:"auth",
        token:jwt.sign({_id:objectId1.toHexString(),access:"auth"},'abc123').toString()
      }
    ]},
  {_id: objectId2,
    email:"user2@gmail.com",
    password:"123abc"
  }
];

var populateTodos = (done)=>{
  var Todo = TodoConstruct.getTodoModel(mongoose.mongoose);
  Todo.remove({}).then((res)=>{
    return Todo.insertMany(todoTests);
  }).then(()=>{
    done();
  }).catch((e)=>done(e));
};

var populateUsers = (done)=>{
  var User = UserConstruct.getUserModel(mongoose.mongoose);
  User.remove({}).then(()=>{
    var user0 = new User(users[0]).save();
    var user1 = new User(users[1]).save();
    return Promise.all([user0,user1]);
  }).then(()=>{
    done();
  }).catch((e)=>{
    done(e);
  });
}

module.exports = {todoTests,populateTodos,users,populateUsers};
