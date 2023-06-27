const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
require('express-async-errors')
const User = require('../models/user')
const Blog = require('../models/blog')

// Route to get all blogs and populate the user property of each blog
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { name: 1, username: 1 })

  response.status(200).json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  response.status(200).json(blog)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  // Decoding token sent in request. This object tells the server who made the request
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  
  // If the object decoded from the token does not contain the user's identity
  // meaning the property is undefined
  if(!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  // Saving the blog to the DB and appending the savedBlog id to
  // the user's blog collection
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

module.exports = blogsRouter