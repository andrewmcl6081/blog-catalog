const blogsRouter = require('express').Router()
require('express-async-errors')
const User = require('../models/user')
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response, next) => {
  
  try {
    const blogs = await Blog.find({})
    console.log(blogs)
    if(blogs) {
      response.status(200).json(blogs)
    }
    else {
      response.status(404).end()
    }
  }
  catch (exception) {
    next(exception)
  }
})

blogsRouter.post('/', async (request, response, next) => {
  const { title, author, url, likes, userId } = request.body

  const user = await User.findById(userId)

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user.id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.json(savedBlog)
})

module.exports = blogsRouter