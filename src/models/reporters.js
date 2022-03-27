const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const reporterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // remove space between name '      Nour     '
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true, //email in use
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  phone:{
      type:Number,
      //required:true,
      validate(value){
          if(!validator.isMobilePhone(value)){
              throw new Error("Mobile number is invalid")
          }
      }

  },
  address: {
    type: String
    
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    validate(value) {
      let password = new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"
      );
      if (!password.test(value)) {
        throw new Error(
          "password must contain uppercase, lowercase,special char"
        );
      }
    },
  },
  tokens: [
    {
      type: String,
      required: true,
    },
  ],
  avatar: {
    type: Buffer,
  },
});

//hashing the password
reporterSchema.pre('save',async function() {
    //this--> points at the document(reporter)
    const reporter=this
    if(reporter.isModified('password'))(   //hash incase of password change ONLYYYYY
        reporter.password= await bcryptjs.hash(reporter.password,8)
    )
    
  })

//login
//statics -->allow us to use function on modell
reporterSchema.statics.findByCredentials= async(mail,password)=>{
    //email-->key
    //mail-->value
    const reporter= await Reporter.findOne({email:mail})
    if(!reporter){
        throw new Error('unable to login')
    }
    console.log(reporter)
    const isMatch= await bcryptjs.compare(password,reporter.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }return reporter
}
////////////////////////////////////////////
//variable to generate tokens for IDs
reporterSchema.methods.generateToken= async function(){
    const reporter= this
    const token= jwt.sign({_id:reporter._id.toString()},process.env.JWT_SECRET)
    reporter.tokens= reporter.tokens.concat(token)
    await reporter.save()
    return token
}


//hide private data from frontend(tokens && passwordd)
reporterSchema.methods.toJSON= function(){
    //return type document NOT Object
    const reporter= this
    //convert to object to be able to delete data
    const reporterObject=reporter.toObject()
    delete reporterObject.password
    delete reporterObject.tokens
    return reporterObject
}

//virtual relation between reporter and news
reporterSchema.virtual('news',{
    ref:'News',
    localField:'_id',
    foreignField:'owner'
})



const Reporter= mongoose.model('Reporter',reporterSchema)

module.exports = Reporter