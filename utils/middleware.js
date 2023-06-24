const logger = require('./logger')

const requestLogger = (request, response, next) => {
    logger.info('Method: ', request.method)
    logger.info('Path: ', request.method)
    logger.info('Body: ', request.body)
    logger.info('--------------------')

    next()
}

const unknownEndpoint = (request, response) => {
    logger.info('inside uknwnEnd')
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    logger.info('inside errorhandler')
    logger.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }

    logger.info('pushing error to next????')

    next(error)
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler
}