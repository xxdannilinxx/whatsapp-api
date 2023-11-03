const dotenv = require('dotenv')
const mongoose = require('mongoose')
const logger = require('pino')()
dotenv.config()

const app = require('./config/express')
const config = require('./config/config')

const { Session } = require('./api/class/session')
const connectToCluster = require('./api/helper/connectMongoClient')

let server

if (config.mongoose.enabled) {
    mongoose.set('strictQuery', true)
    mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
        logger.info('Connected to MongoDB')
    })
}

server = app.listen(config.port, async () => {
    logger.info(`Listening on port ${config.port}`)
    global.mongoClient = await connectToCluster(config.mongoose.url)
    if (config.restoreSessionsOnStartup) {
        logger.info(`Restoring Sessions`)
        const session = new Session()
        let restoreSessions = await session.restoreSessions()
        logger.info(`${restoreSessions.length} Session(s) Restored`)
    }
})

const exitHandler = () => {
    if (server) {
        server.close((err) => {
            process.exit(err ? 1 : 0)
        })
    } else {
        process.exit(1)
    }
}

const unexpectedErrorHandler = (error) => {
    logger.error(error)
    exitHandler()
}

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)

process.on('SIGTERM', () => {
    logger.error('SIGTERM received')
    if (server) {
        server.close((err) => {
            process.exit(err ? 1 : 0)
        })
    }
})

process.on('exit', function (code) {
    return logger.error('Server closed with code', code)
})

module.exports = server
