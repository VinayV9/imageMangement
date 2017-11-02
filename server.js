var express=require('express')
var multer=require('multer')
var cors=require('cors')
var mongoose=require('mongoose')
var Image=require('./imagedb')
var path= require('path')
var del=require('del')
var UPLOAD_PATH='uploads'
var app=express()
var fs=require('fs')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOAD_PATH)
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
   
var upload = multer({ storage: storage })
app.use(cors())

// var routes=require('./routes')

var url ='mongodb://localhost/imageupload'
mongoose.connect(url, function(err){
    if(err) console.log(err)
    else console.log("connected to mongodb")
})
app.listen(3000, function(){
    console.log("port on 3000")
})

app.post('/images', upload.single('image'), function(req, res, next){
    var newImage=new Image()
    newImage.filename = req.file.filename;
    newImage.originalName = req.file.originalname;
    newImage.desc = req.body.desc
    newImage.save(err => {
        if (err) {
            return res.sendStatus(400);
        }
        res.status(201).send({ newImage });
    });
} )

app.get('/images', function(req, res, next){
    Image.find({}, '-__v').lean().exec((err, images) => {
        if (err) {
            res.sendStatus(400);
        }
 
        // Manually set the correct URL to each image
        for (let i = 0; i < images.length; i++) {
            var img = images[i];
            img.url = req.protocol + '://' + req.get('host') + '/images/' + img._id;
        }
        res.json(images);
    })
})

app.get('/images/:id', function(req,res, next){
    let imgId = req.params.id;
    
       Image.findById(imgId, (err, image) => {
           if (err) {
               res.sendStatus(400);
           }
           // stream the image back by loading the file
           res.setHeader('Content-Type', 'image/jpeg');
           fs.createReadStream(path.join(UPLOAD_PATH, image.filename)).pipe(res);
       })
})

app.delete('images/id:', function(req,res, next){
    let imgId = req.params.id;
    
       Image.findByIdAndRemove(imgId, (err, image) => {
           if (err && image) {
               res.sendStatus(400);
           }
    
           del([path.join(UPLOAD_PATH, image.filename)]).then(deleted => {
               res.sendStatus(200);
           })
       })
})

// module.exports=app
// module.exports=upload
// module.exports=UPLOAD_PATH