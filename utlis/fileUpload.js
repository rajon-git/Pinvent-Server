const multer=require("multer")

const storage=multer.diskStorage(
    {
        destination: function (req, file, cb) {
            cb(null, "uploads");
        },
        filename: function (req, file, cb) {
            cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname);
        }
    });
function fileFilter(req,file,cb){
    if(
        file.mimetype==="image/png" ||
        file.mimetype==="image/jpg" ||
        file.mimetype==="image/jpeg"
    ){
        cb(null,true)
    }else{
        cb(null,false)
    }
}
const upload=multer({storage,fileFilter});
module.exports={upload};

//1. create storage (where one is destination another filename)
//2. filter file
//3. then execute storage and filefilter