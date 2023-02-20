const mongoose=require("mongoose")
const bcrypt=require("bcryptjs")
const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please add your name"],
        trim:true
    },
    email:{
        type:String,
        required:[true,"Please add an email"],
        trim:true,
        unique:true,
        match:[
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email"
        ]
    },
    password:{
        type:String,
        required:[true,"Please add a password"],
        trim:true,
        minLength:[6,"Password must be more than 6 character"]
    },
    phone:{
        type:String,
        required:[true,"Please add a phone number"],
        default:"+880"
    },
    bio:{
        type:String,
        default:"Bio"
    },
    photo:{
        type:String,
        default:"https://i.ibb.co/4pDNDk1/avatar.png"
    }
},{timestamps:true,versionKey:false});

//hashed password after saving in db
/*
 */
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next();
    }
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(this.password,salt);
    this.password=hashedPassword;
    next();
})
const User=mongoose.model("User",userSchema);
module.exports=User;
