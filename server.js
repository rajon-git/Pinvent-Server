const express=require("express");
const app=express();
const path=require("path")
const mongoose=require("mongoose")
const morgan=require("morgan")
const helmet=require("helmet")
const {readdirSync}=require("fs")
const cors=require("cors")
require("dotenv").config();
const cookieParser=require("cookie-parser")

//implement middlewares
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:false}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//routes middelwares
readdirSync("./routes").map(r=>app.use("/api/v1",require(`./routes/${r}`)));
//server
const port=process.env.PORT || 5000;

mongoose.connect(process.env.DATABASE)
        .then( ()=>{
            app.listen(port,()=>{
            console.log(`Server is running on port ${port}`);
           });
        })
         .catch((error)=> console.log(error));
