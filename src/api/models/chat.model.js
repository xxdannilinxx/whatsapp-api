const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    key: {
        type: String,
        required: [true, 'key is missing'],
        unique: true,
    },
    chat: {
        type: Array,
    },
    webhookUrl: String,
})

const Chat = mongoose.model('Chat', chatSchema)

module.exports = Chat
