getUserModel = (mongoose)=>{
  return mongoose.model('User',{
    name:{
      type:String,
      required:true,
      trim:true,
      minlength:1
    },
    email:{
      type:String,
      required:true
    }
  });
};

saveUserDocument = (newUser)=>{
  return newUser.save();
};

module.exports = {
  getUserModel,
  saveUserDocument
};
