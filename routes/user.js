const express=require("express")
const router=express.Router()
const protect=require("../middlewares/auth")
const {registerUser,loginUser,logoutUser,getUser,loggedinStatus,updateUser,changePassword,forgotPassword,resetPassword}=require("../controllers/user");

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/logout",logoutUser);
router.get("/getuser",protect,getUser);
router.get("/loggedin",loggedinStatus);
router.patch("/update",protect,updateUser);
router.patch("/changepassword",protect,changePassword);
router.post("/forgotpassword",forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);
module.exports=router;