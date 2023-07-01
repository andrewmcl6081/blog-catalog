const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const helper = require('../utils/listHelper')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')
const Blog = require('../models/blog')

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body.length).toBe(helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const titles = response.body.map(blog => blog.title)

    expect(titles).toContain('React patterns')
  })

  afterAll(async () => {
    await Blog.deleteMany({})
    await mongoose.connection.close()
  })
})

describe('when there is initially a user in the database', () => {
  beforeEach( async () => {
    // Clear and create an existing user
    await User.deleteMany({})
    await api.post('/api/users').send(helper.testUser)
  })

  test('registering with an already existing username will reject with statuscode 400', async () => {
    await api
      .post('/api/users').send(helper.testUser)
      .expect(400)
  })

  test('a password shorter than 8 characters will reject with statuscode 400 and an error', async () => {
    const user = {
      username: 'test',
      name: 'test',
      password: 'short'
    }

    const response = await api.post('/api/users').send(user)
    
    expect(400)
    expect(response.body.error).toContain('password length must be atleast 8 characters')
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })
})

describe('when signing a user in', () => {
  beforeEach( async () => {
    await User.deleteMany({})
    await api.post('/api/users').send(helper.testUser)
  })

  test('signing in returns a 200 statuscode and a valid token', async () => {
    const { username, password } = helper.testUser

    const response = await api.post('/api/login').send({ username, password })
    
    expect(200)
    expect(response.body.token).toBeDefined()
  })

  afterAll( async () => {
    await mongoose.connection.close()
  })

})

describe('when a new user is created', () => {
  beforeEach( async () => {
    await User.deleteMany({})
  })

  test('creating a new user will respond with a 201 statuscode', async () => {
    await api.post('/api/users')
      .send(helper.testUser)
      .expect(201)
  })

  afterAll( async () => {
    await mongoose.connection.close()
  })
})