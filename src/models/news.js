const mongoose= require ('mongoose')

const News= mongoose.model('News',{
    title:{
        type:String,
        required:true,
        trim:true  // remove space between name '      Nour     '
    },
    description:{
        type:String,
        required:true,
        trim:true,
        
    },
    picture:{
        type:Buffer
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Reporter'
    }
})

module.exports = News