const blogsRouter = require('express').Router()
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
  const extractedUser = request.user

  if(!extractedUser.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const matchingUser = await User.findById(extractedUser.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: matchingUser._id
  })

  // Save blog to blogs collection
  const savedBlog = await blog.save()
  
  // Append the savedBlog id to the user's collection array of blogs and save
  matchingUser.blogs = matchingUser.blogs.concat(savedBlog._id)
  await matchingUser.save()

  // Populate the user property of the savedBlog document
  await savedBlog.populate('user', { name: 1, username: 1 })
  
  response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
  const blog = request.body
  const extractedUser = request.user

  if(!extractedUser.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const newBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  return response.status(200).json(newBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  const extractedUser = request.user

  console.log(blog.user.toString())
  console.log(request.user)

  if (!extractedUser.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  else if ( !(blog.user.toString() === extractedUser.id.toString()) ) {
    return response.status(401).json({ error: 'unauthorized to perform action'})
  }

  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter