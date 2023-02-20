const User=require("../models/user")
const jwt=require("jsonwebtoken")
const asyncHandler=require("express-async-handler")
const bcrypt=require("bcryptjs")
const crypto=require("crypto")
const Token=require("../models/token")
const sendEmail=require("../utlis/sendEmail")
//generate token
const generateToken=(id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET,{expiresIn:"7d"});
}
//register controllers
const registerUser=asyncHandler(async (req,res)=>{
    const {name,email,password}=req.body;
    //validation
    if(!name || !email || !password){
        res.status(400);
        throw new Error("Please filled required options");
    }
    if(password.length<6){
        res.status(400);
        throw new Error("Password must be more than 6 character");
    }
    //find user already havn't a account
    const userExists=await User.findOne({email});
    if(userExists){
        res.status(400);
        throw new Error("User already have an account");
    }
    //create a user
    const user=await User.create({name,email,password});
    //make a token for user
    const token=generateToken(user._id);
    res.cookie("token",token,{
        path:"/",
        //secure:true,
        httpOnly:true,
        sameSite:"none",
        expiresIn:new Date(Date.now()+1000*86400*7) //7day
    });
    if(user){
        const {_id,name,email,phone,photo,bio}=user;
        res.status(201).json({
            _id,
            name,
            email,
            phone,
            photo,
            bio,
            token
        })
    }else{
        res.status(400);
        throw new Error("Invalid data")
    }
});

//loginUser
const loginUser=asyncHandler(async (req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        res.status(400);
        throw new Error("Please filled required options");
    }
    const user=await User.findOne({email});
    if(!user){
        res.status(400);
        throw new Error("Please signup first");
    }
    //check password
    const correctPassword=await bcrypt.compare(password,user.password);
    //generate token
    const token=generateToken(user._id);
    res.cookie("token",token,{
        path:"/",
        //secure:true,
        httpOnly:true,
        sameSite:"none",
        expiresIn:new Date(Date.now()+1000*86400*2) //2 day
    });
    if(user && correctPassword){
        const {_id,name,email,phone,photo,bio}=user;
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio
        });
    }else{
        res.status(400);
        throw new Error("Invalid data");
    }
});

//logoutUser
const logoutUser=asyncHandler(async (req,res)=>{
    res.cookie("token","",{
        path:"/",
        //secure:true,
        sameSite:"none",
        httpOnly:true,
        expiresIn:new Date(0)
    });
    return res.status(200).json({message:"logout successfully"});

});
//getUser
const getUser=asyncHandler(async (req,res)=>{
    const user=await User.findById(req.user._id);
    if(user){
        const {_id,name,email,phone,photo,bio}=user;
        res.status(200).json({
            _id,
            name,
            email,
            phone,
            photo,
            bio
        });
    }else{
        res.status(400);
        throw new Error("User not found");
    }
});

//loggedinStatus
const loggedinStatus=asyncHandler(async (req,res)=>{
    const token=req.cookies.token;
    if(!token){
        return res.json(false);
    }
    //verify token
    const verified=jwt.verify(token,process.env.JWT_SECRET);
    if(verified){
        return res.json(true)
    }
    return res.json(false);

});

//updateUser
const updateUser=asyncHandler(async (req,res)=>{
    const user=await User.findById(req.user._id);
    if(user) {
        const {name, email, phone, photo, bio} = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.photo = req.body.photo || photo;
        user.bio = req.body.bio || bio;

        const updateUser = await user.save();
        res.status(200).json({
            _id: updateUser._id,
            name: updateUser.name,
            email: updateUser.email,
            phone: updateUser.phone,
            photo: updateUser.photo,
            bio: updateUser.bio
        });
    }else{
        res.status(400);
        throw new Error("User not found")
    }
})

//changePassword
const changePassword=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user._id);
    const {oldPassword,newPassword}=req.body;

    //validate 
    if(!user){
        res.status(400);
        throw new Error("User not found");
    }
    if(!oldPassword || !newPassword){
        res.status(400);
        throw new Error("Please filled required options");
    }
    //check oldpassword 
    const correctPassword= await bcrypt.compare(oldPassword, user.password);

    if(user && correctPassword){
        user.password=newPassword;
        await user.save();
        res.status(200).send("Password change successfully");
    }else{
        res.status(400);
        throw new Error("Invalid data");
    }
});

//forgotPassword
const forgotPassword=asyncHandler(async (req,res)=>{
    const {email}=req.body;
    const user=await User.findOne({email});
    if(!user){
        res.status(401);
        throw new Error("User not found");
    }
    //delete token if already exists
    const token=await Token.findOne({userId:user._id});
    if(token){
        await token.deleteOne();
    }
    //create reset token
    let resetToken=crypto.randomBytes(32).toString("hex")+ user._id;

    //hashtoken before saving in db
    const hashedToken=crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    //save token in db
    await new Token({
        userId:user._id,
        token:hashedToken,
        createdAt:Date.now(),
        expiresAt:Date.now()+15*(60*1000), //15 mnt
    }).save();

    //constract reset url
    const resetUrl=`${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
    //reset email
    const message=`
    <h2>Hello ${user.name}</h2>
    <p>Please use the url bellow to reset your password</p>
    <p>This reset link is valid for only 15 minutes.</p>
    <a href=${resetUrl} clicktracking="off">${resetUrl}</a>
     <p>Regards...</p>
     <p>Pinvent Team</p>`;
    const subject = "Password Reset Request";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;

    try {
        await sendEmail(subject, message, send_to, sent_from);
        res.status(200).json({ success: true, message: "Reset Email Sent again" });
    } catch (error) {
        res.status(500);
        throw new Error("Email not sent, please try again");
    }
});
//resetPassword
const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { resetToken } = req.params;

    // Hash token, then compare to Token in DB
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // fIND tOKEN in DB
    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: { $gt: Date.now() },
    });

    if (!userToken) {
        res.status(404);
        throw new Error("Invalid or Expired Token");
    }

    // Find user
    const user = await User.findOne({ _id: userToken.userId });
    user.password = password;
    await user.save();
    res.status(200).json({
        message: "Password Reset Successful, Please Login",
    });
});

module.exports={registerUser,loginUser,logoutUser,getUser,loggedinStatus,updateUser,changePassword,forgotPassword,resetPassword}