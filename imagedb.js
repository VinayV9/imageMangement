var mongoose =require('mongoose')

var ImageModel=mongoose.Schema({
    filename:String,
    originalName:String,
    desc:String,
    created:{ type: Date, default: Date.now }
})

module.exports=mongoose.model('Image',ImageModel)