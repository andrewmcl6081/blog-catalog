const logger = require('./logger')
const jwt = require('jsonwebtoken')

const requestLogger = (request, response, next) => {
  logger.info('Method: ', request.method)
  logger.info('Path: ', request.method)
  logger.info('Body: ', request.body)
  logger.info('--------------------')

  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.log('in errorHandler')
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  else if (error.name === 'JsonWebTokenError') {
    console.log('in JWTERRR')
    return response.status(401).json({ error: error.message})
  }
  else if (error.message === 'password length must be atleast 8 characters') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const userExtractor = (request, response, next) => {
  const decodedUser = jwt.verify(request.token, process.env.SECRET)

  if (decodedUser.id) {
    request.user = decodedUser
  }

  next()
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  
  if(authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  }
  
  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}