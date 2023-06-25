const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response, next) => {

  try {
    const users = await User.find({})
    return response.status(200).json(users)
  }
  catch (exception) {
    next(exception)
  }
})

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  try {
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  }
  catch (exception) {
    next(exception)
  }
})

module.exports = usersRouter