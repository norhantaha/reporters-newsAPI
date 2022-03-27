const express=require('express')
const router= express.Router()
const News = require('../models/news')
const auth= require('../middelware/auth.js')
const multer=require('multer')

router.post('/news',auth,async(req,res)=>{
    try{
        // ... spread operator copy data
        const news = new News({...req.body,owner:req.reporter._id})
        await news.save()
        res.status(200).send(news)
    }
    catch(e){
        res.status(400).send(e.message)
    }

})

router.get('/news',auth,async(req,res)=>{
    try{
        // const tasks = await Task.find({})
        // res.status(200).send(tasks)
        await req.user.populate('news')
        res.status(200).send(req.reporter.news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})

router.get('/news/:id',auth,async(req,res)=>{
    try{
        // const task = await Task.findById(req.params.id)
        const _id = req.params.id
        // 62e  owner:1d3
        // 631 owner:1d3
        const news = await News.findOne({_id,owner:req.reporter._id})
        console.log(news)
        if(!news){
          return  res.status(404).send('Unable to find news')
        }
        res.send(news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})

 //update by id
router.patch('/news/:id', auth,async(req,res)=>{
    try{
        const _id= req.params.id
        const news = await News.findOneAndUpdate({_id,owner:req.reporter._id},{
            new:true,
            runValidators:true
        })
        if(!news){
            return res.status(404).send('NO news found')
        }
        res.status(200).send(news)
    }
    catch(error){
        res.status(500).send(error)
    }
})

router.delete('/news/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id
        const news = await News.findOneAndDelete({_id,owner:req.reporter._id})
        if(!news){
         return  res.status(404).send('No news is found')
        }
        res.status(200).send(news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})

router.get('/reporterNews/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id
        const news = await News.findOne({_id,owner:req.reporter._id})
        if(!news){
            return res.status(404).send('No news')
        }
        await news.populate('owner') // refrence 
        res.status(200).send(news.owner)
    }
    catch(e){
        res.status(500).send(e)
    }
})

const uploads= multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
            return cb(new Error('please upload image'))
        }
        cb(null,true)
    }
})

router.post('/news/picture',auth,uploads.single('picture'),async(req,res)=>{
    try{
        req.news.picture= req.file.buffer
        await req.reporter.save()
        res.send()
    }
    catch(e){
        res.send(e)
    }
})


module.exports = router