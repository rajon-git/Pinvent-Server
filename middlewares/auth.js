const jwt=require("jsonwebtoken")
const User=require("../models/user")
const asyncHandler=require("express-async-handler")
const protect=asyncHandler(async (req,res,next)=>{
    const token=req.cookies.token;
    if(!token){
        res.status(401);
        throw new Error("Unauthorized,Please login")
    }
    //verify token
    const verified=jwt.verify(token, process.env.JWT_SECRET);
    const user=await User.findById(verified.id).select("-password");
    if(!user){
        res.status(401);
        throw new Error("Unauthorized,Please login");
    }
    req.user=user;
    next();
});
module.exports=protect;