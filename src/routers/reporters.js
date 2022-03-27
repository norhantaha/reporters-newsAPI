const express=require('express')
const router=express.Router()
const multer=require('multer')
const Reporter=require('../models/reporters')
const auth=require('../middelware/auth')

//post
router.post('/reporters',async(req,res)=>{
    try{
        const reporter=new Reporter(req.body)
        const token=await reporter.generateToken()
        await reporter.save()
        res.status(200).send({reporter,token})
    }
    catch(e){
        res.status(400).send(e)
    }
})
//login
router.post('/login',async(req,res)=>{
    try{
        const reporter=await Reporter.findByCredentials(req.body.email,req.body.password)
        const token=await reporter.generateToken()
        res.status(200).send({reporter,token})
    }
    catch(error){
        res.status(400).send(error.message)
    }
})
//profile
router.get('/profile',auth,async(req,res)=>{
    res.status(200).send(req.reporter)
})
//logout
router.delete('/logout',auth,async(req,res)=>{
    try{
        console.log(req.reporter)
        req.reporter.token=req.reporter.token.filter((el)=>{
            return el !==req.token
        })
        await req.reporter.save()
        res.send()
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
//logout ALL
router.delete('/logoutAll',auth,async(req,res)=>{
    try{
        req.reporter.token=[]
        await req.reporter.save()
        res.send()
    }
    catch(e){
        res.status(500).send(e)
    }
})
//
//Get By ID
router.get('/reporters/id',auth,(req,res)=>{
    console.log(req.params)
    const _id= req.params.id
    Reporter.findById(_id).then((reporter)=>{
        if(!reporter){
            return res.status(404).send('Unable to find reporter')
        }
        res.status(200).send(reporter)

    }).catch((e)=>{
        res.status(500).send(e)
    })
})
//Update by ID
router.patch('/reporters/:id', auth,async(req,res)=>{
    try{
        const updates= Object.keys(req.body)
        console.log(updates) //to print the keys that want to be modified
        const _id= req.params.id
        const reporter = await User.findById(_id)
        if(!reporter){
            return res.status(404).send('NO reporter found')
        }
        updates.forEach((update)=>(reporter[update]=req.body[update]))
        await reporter.save()
        res.status(200).send(reporter)
    }
    catch(error){
        res.status(400).send(error.message)
    }
})
//Delete By ID
router.delete('/reporters/:id',auth,async(req,res)=>{
    try{
        const _id= req.params.id
        const reporter= await User.findByIdAndDelete(_id)
        if(!reporter){
            return res.status(404).send('unable to find reporter')
        }
        res.status(200).send(reporter)
    }
    catch(e){
        res.status(500).send(e)
    }
})
//MUlter(Avatar)
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

router.post('/profile/avatar',auth,uploads.single('avatar'),async(req,res)=>{
    try{
        req.reporter.avatar= req.file.buffer
        await req.reporter.save()
        res.send()
    }
    catch(e){
        res.send(e)
    }
})

module.exports= router