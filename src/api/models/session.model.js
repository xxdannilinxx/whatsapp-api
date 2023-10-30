const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
    key: String,
    webhookUrl: String,
})

const Session = (key) => mongoose.model(key, sessionSchema)

module.exports = Session
