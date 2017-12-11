var TodoModel = null;
const mongoose = require('./../db/mongoose');

getTodoModel = (mongoose)=>{
  if(TodoModel){
    return TodoModel;
  }else{
    TodoModel = mongoose.model('Todo',{
      text:{
        type:String,
        required:true,
        trim:true,
        minlength:1
      },
      completed:{
        type:Boolean,
        default:false
      },
      completedAt:{
        type:Number,
        default:null
      },
      _creator:{
        required:true,
        type:String
      }
    });
    return TodoModel;
  }
};

saveTodoDocument = (newTodo)=>{
  return newTodo.save();
};

module.exports = {
  getTodoModel,
  saveTodoDocument
};
