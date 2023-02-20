const mongoose=require("mongoose");
const productSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId, //conncet with user collection
        required:true,
        ref:"User"
    },
    name:{
        type:String,
        required:[true, "Please add a name"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"Please add description"],
        trim:true,
        maxLength:[200,"Description must be less than 200 character"]
    },
    sku:{
        type:String,
        required:true,
        default: "SKU",
        trim:true
    },
    category:{
        type:String,
        required:[true,"Please add a category"],
        trim:true
    },
    price:{
        type:String,
        required:[true,"Please add a price"],
        trim:true
    },
    quantity:{
        type:String,
        required:[true,"Please add quantity"],
        trim:true
    },
    image:{
        type:Object,
        required:{}
    }
    },
{
    timestamps:true

});
const Product=mongoose.model("Product",productSchema);
module.exports=Product;