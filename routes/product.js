const express=require("express")
const router=express.Router();
const protect=require("../middlewares/auth")
const {upload}=require("../utlis/fileUpload");
const {createProduct,updateProduct,getProducts,getProduct,deleteProduct}=require("../controllers/product");

router.post("/",protect,upload.single("image"),createProduct);
router.patch("/:id",protect,upload.single("image"),updateProduct);
router.get("/",protect,getProducts);
router.get("/:id",protect,getProduct);
router.delete("/:id",protect,deleteProduct)
module.exports=router;