const usersRouter = require('express').Router()
require('express-async-errors')
const bcrypt = require('bcryptjs')
const User = require('../models/user')

usersRouter.get('/', async (request, response, next) => {

  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })

  return response.status(200).json(users)
})

// Route to create a new user in the DB
usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body

  // Handle password length enforcement since we dont save raw passwords to DB
  if (password.length < 8) {
    // return response.status(400).json({ error: 'password length must be atleast 8 characters' })
    throw Error('password length must be atleast 8 characters')
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

module.exports = usersRouter