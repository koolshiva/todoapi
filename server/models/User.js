const validator = require('validator');
var mongoose = require("./../db/mongoose");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
bcryptjs = require('bcryptjs');
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
  try{
    var decoded = jwt.verify(token,'abc123');
  }catch(e){
    return Promise.reject();
  }
  return UserModel.findOne({
    '_id':decoded._id,
    'tokens.token':token,
    'tokens.access':'auth'
  })

}

UserSchema.statics.findByCredentials = function(email,password){
  var User  = this;
  return User.findOne({email}).then((user)=>{
    if(!user){
      return Promise.reject();
    }

    return new Promise((resolve,reject)=>{
      bcryptjs.compare(password,user.password,(err,res)=>{
        if(res){
          resolve(user);
        }else{
          reject();
        }
      });
    });
  });
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
  user.tokens.push({access,token});
  return user.save().then(()=>{
      return token;
  });
}

UserSchema.pre('save',function(next){
  var user = this;
  var password = null,hash = null;
  if(user.isModified('password')){
    password = user.password;
    bcryptjs.genSalt(10,(err,salt)=>{
      bcryptjs.hash(password,salt,(err,hash)=>{
        user.password = hash;
        next();
      });
    })
  }else{
    next();
  }
});

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
