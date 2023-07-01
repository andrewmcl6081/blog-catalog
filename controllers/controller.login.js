const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const loginRouter = require('express').Router()
require('express-async-errors')
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  console.log('------ in login route ------')
  const { username, password } = request.body

  // Searching for a matching username in DB
  // Upon finding a valid user, we compare the request pw
  // With the hashed pw in the DB
  const user = await User.findOne({ username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if(!(user && passwordCorrect)) {
    return response.status(401).json({ error: 'invalid username or password'})
  }

  // Defining a token for the user containing id and username
  const userForToken = {
    username: user.username,
    id: user._id
  }

  // Creating the user specific token and returning it in the response
  const token = jwt.sign(userForToken, process.env.SECRET)
  response.status(200).send({ token, username: user.username, name: user.name})
})

module.exports = loginRouter