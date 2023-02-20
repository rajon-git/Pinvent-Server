const asyncHandler=require("express-async-handler");
const User=require("../models/user");
const sendEmail=require("../utlis/sendEmail")
const contactUs=asyncHandler(async (req,res)=>{
     const {subject,message}=req.body;
    const user=await User.findById(req.user._id);
    if(!user){
        res.status(400);
        throw new Error("User not found");
    }

     if(!subject || !message){
         res.status(400);
         throw new Error("Please filled require fills");
     }
     const send_to=process.env.EMAIL_USER;
     const sent_from=process.env.EMAIL_USER;
     const reply_to=user.email;
     try{
         await sendEmail(subject,message,send_to,sent_from,reply_to);
         res.status(200).json({message:"Email sent"})
     }catch(error){
         res.status(400).json({message:"Email not sent"});
     }
})
module.exports={contactUs};