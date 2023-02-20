const express=require("express")
const router=express.Router();
const protect=require("../middlewares/auth")
const {contactUs}=require("../controllers/contact");

router.post("/",protect,contactUs);
module.exports=router;