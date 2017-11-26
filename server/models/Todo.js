var TodoModel = null;

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
