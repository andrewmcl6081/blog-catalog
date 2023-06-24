const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const initialBlogs = require('../utils/listHelper').initialBlogs

beforeEach(async () => {
  await Blog.deleteMany({})
  console.log('cleared database')

  await Promise.all(
    initialBlogs.map(async (blog) => {
      let blogObject = new Blog(blog)
      await blogObject.save()
      console.log('blog saved')
    })
  )

  console.log('all test blogs saved')
})


test('blogs are proper length as what is saved', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body.length).toBe(initialBlogs.length)
})

test('verify property id is not being returned as _id', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body[0].id).toBeDefined()
})

test('verify credibility of POST', async () => {
  const newBlog = {
    title: "test title",
    author: "test author",
    url: "test url",
    likes: 99
  }

  const response = await api.post('/api/blogs').send(newBlog)
  
  expect(response.status).toBe(201)
})

test('verify likes value is 0 if it is missing', async () => {
  const newBlog = {
    title: "test title",
    author: "test author",
    url: "test url"
  }

  const response = await api.post('/api/blogs').send(newBlog)

  expect(response.body.likes).toBe(0)
})

test('verify thrown error for missing title', async () => {
  const newBlog = {
    author: "testing",
    url: 'test url',
    likes: 20
  }

  const response = await api.post('/api/blogs').send(newBlog)

  expect(response.status).toBe(400)
})

afterAll(async () => {
  await mongoose.connection.close()
})