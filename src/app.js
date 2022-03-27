const express = require('express')
require('dotenv').config()
const app = express()
const port = process.env.PORT

require('./db/mongoose')
// parse automatic
app.use(express.json())

const reporterRouter = require('./routers/reporters')
const newsRouter = require('./routers/news')
const News = require('./models/news')
app.use(reporterRouter)
app.use(newsRouter)


app.listen(port,()=>{console.log('Server is running ' + port)})