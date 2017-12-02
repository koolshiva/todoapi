const validator = require('validator');
var mongoose = require("./../db/mongoose");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
var UserSchema = new mongoose.mongoose.Schema({
  email:{
    type:String,
    required:true,
    minlength:1,
    trim:true,
    validate:{
      validator:validator.isEmail,
      message:"{VALUE} is not a valid email."
    },
    unique:true
  },
  password:{
    type:String,
    required:true,
    trim:true,
    minlength:6
  },
  tokens:[
    {
      access:{
      type:String,
      required:true
    },
    token:{
      type:String,
      required:true
    }
  }]
});

UserSchema.statics.findByToken = function(token){
  var User = this;
  console.log(token,token);
  try{
    var decoded = jwt.verify(token,'abc123');
    console.log(decoded);
  }catch(e){
    console.log(e);
    return Promise.reject();
  }
  return UserModel.findOne({
    '_id':decoded._id,
    'tokens.token':token,
    'tokens.access':'auth'
  })

}

UserSchema.methods.toJSON = function(){
  var user = null;
  userObject = this.toObject();
  user = _.pick(userObject,["_id","email"]);
  return user;
}

UserSchema.methods.getAuthToken = function(){
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id:user._id.toHexString(),access},'abc123').toString();
//console.log("first");
  return {access,token};
  // .save().then((userWithToken)=>{
  //   return userWithToken;
  // });
}

var UserModel = mongoose.mongoose.model('User',UserSchema);
getUserModel = (mongoose)=>{
  return UserModel;
};

saveUserDocument = (newUser)=>{
  return newUser.save();
};

module.exports = {
  getUserModel,
  saveUserDocument
};
