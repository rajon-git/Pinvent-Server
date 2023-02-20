const asyncHandler=require("express-async-handler");
const Product=require("../models/product")
//create product
const createProduct=asyncHandler(async (req,res)=>{
    const {name,description,price,quantity,sku,category}=req.body;
    if(!name || ! description || ! price || !quantity ||! category){
        res.status(400);
        throw new Error("Please fill required fills")
    }
    //image upload
    let fileData={};
    if(req.file){
        fileName:req.file.originalname;
        filePath:req.file.path;
        fileType:req.file.mimetype;
        fileSize:req.file.size
    }
    //create product
    const product=await Product.create({
        user:req.user.id,
        name,
        category,
        price,
        quantity,
        sku,
        description,
        image:fileData
    });
    res.status(201).json(product)
});
//updateProduct
const updateProduct=asyncHandler(async (req,res)=>{
    const {name,category,description,quantity,price}=req.body;
    const {id}=req.params;

    const product=await Product.findById(id);
    if(!product){
        res.status(400);
        throw new Error("Products not found");
    }
    //match products with user
    if(product.user.toString() !== req.user.id){
        res.status(401);
        throw new Error("User not Authorized");
    }

    //handle image upload
    let fileData={};
    if (req.file){
        fileData={
            fileName:req.file.originalname,
            filePath:req.file.path,
            fileType:req.file.type,
            fileSize:req.file.size
        };
    }
    const updatedProduct=await Product.findByIdAndUpdate({_id:id},{
        name,
        category,
        quantity,
        price,
        description,
        image:Object.keys(fileData).length===0 ?product?.image:fileData
    },
        {new:true,
        runValidators:true
        });
    res.status(200).json(updatedProduct);
})
//getProducts
const getProducts=asyncHandler(async (req,res)=>{
    const products=await Product.find({user:req.user.id}).sort("-createdAt");
    res.status(200).json(products);
});
//get single Product
const getProduct=asyncHandler(async (req,res)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        res.status(400);
        throw new Error("Product not found");
    }
    //match with user
    if(product.user.toString() !== req.user.id){
        res.status(401);
        throw new Error("User unAuthorized");
    }
    res.status(200).json(product);

});
//deleteProduct
const deleteProduct=asyncHandler(async (req,res)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        res.status(400);
        throw new Error("Product not found");
    }
    //match product with user
    if(product.user.toString() !== req.user.id){
        res.status(401);
        throw new Error("User not Authorized");
    }
    await product.remove();
    res.status(200).json({message:"Product remove successfully"});
})
module.exports={createProduct,updateProduct,getProducts,getProduct,deleteProduct};