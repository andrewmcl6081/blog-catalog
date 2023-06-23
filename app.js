const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs')
const config = require('./utils/config')

mongoose.set('strictQuery', false)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB', error.message)
  })

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter)

module.exports = app