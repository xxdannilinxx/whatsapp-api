const { WhatsAppInstance } = require('../class/instance')
const fs = require('fs')
const config = require('../../config/config')
const { Session } = require('../class/session')

exports.init = async (req, res) => {
    try {
        const { key } = req.query

        if (key in WhatsAppInstances) {
            throw new Error("Instance already exists")
        }

        const webhook = !req.query.webhook ? false : req.query.webhook
        const webhookUrl = !req.query.webhookUrl ? null : req.query.webhookUrl
        const appUrl = config.appUrl || req.protocol + '://' + req.headers.host
        const instance = new WhatsAppInstance(key, webhook, webhookUrl, true)
        const data = await instance.init()

        WhatsAppInstances[data.key] = instance

        return res.json({
        error: false,
        message: 'Initializing successfully',
        key: data.key,
        webhook: {
            enabled: webhook,
            webhookUrl: webhookUrl,
        },
        qrcode: {
            url: appUrl + '/instance/qr?key=' + data.key,
        },
        browser: config.browser,
    })
    } catch (error) {
        return res.json({
            error: true,
            message: "Unable to start the instance",
            errormsg: error ? error : null,
        })
    }
}

exports.qr = async (req, res) => {
    try {
        let { key } = req.query
        if (!key in WhatsAppInstances) {
            throw new Error("Instance not exists")
        }

        const qrcode = await WhatsAppInstances[key]?.instance.qr
        if (!qrcode) {
            throw new Error("Check if you are already connected")
        }

        return res.render('qrcode', {
            error: false,
            message: "Qrcode generated successfully",
            qrcode: qrcode,
        })
    } catch (error) {
        return res.json({
            error: true,
            message: "Unable to generate Qrcode",
            errormsg: error ? error : null,
            qrcode: null,
        })
    }
}

exports.qrbase64 = async (req, res) => {
    try {
        let { key } = req.query
        if (!key in WhatsAppInstances) {
            throw new Error("Instance not exists")
        }

        const qrcode = await WhatsAppInstances[key]?.instance.qr
        if (!qrcode) {
            throw new Error("Check if you are already connected")
        }

        return res.json({
            error: false,
            message: "Qrcode64 generated successfully",
            qrcode: qrcode,
        })
    } catch (error) {
        return res.json({
            error: true,
            message: "Unable to generate Qrcode64",
            errormsg: error ? error : null,
            qrcode: null,
        })
    }
}

exports.info = async (req, res) => {
    try {
        let { key } = req.query
        if (!key in WhatsAppInstances) {
            throw new Error("Instance not exists")
        }

        let data = await WhatsAppInstances[key].getInstanceDetail(key)

        return res.json({
            error: false,
            message: 'Instance fetched successfully',
            instance_data: data,
        })
    } catch (error) {
        return res.json({
            error: true,
            message: "Unable to generate Qrcode64",
            errormsg: error ? error : null,
            data: {},
        })
    }
}

// exports.restore = async (req, res, next) => {
//     try {
//         const session = new Session()
//         let restoredSessions = await session.restoreSessions()

//         return res.json({
//             error: false,
//             message: 'All instances restored',
//             data: restoredSessions,
//         })
//     } catch (error) {
//         next(error)
//     }
// }

exports.logout = async (req, res) => {
    try {
        let { key } = req.query
        if (!key in WhatsAppInstances) {
            throw new Error("Instance not exists")
        }

        await WhatsAppInstances[key].instance?.sock?.logout()

        return res.json({
            error: false,
            message: 'Logout successfull',
        })
    } catch (error) {
        return res.json({
            error: true,
            message: 'Logout unsuccessfull',
            errormsg: error ? error : null,
        })
    }

}

exports.delete = async (req, res) => {
    try {
        let { key } = req.query
        if (!key in WhatsAppInstances) {
            throw new Error("Instance not exists")
        }

        await WhatsAppInstances[key].deleteInstance(key)

        if (WhatsAppInstances[key].instance?.online === true) {
            await WhatsAppInstances[key].instance?.sock?.logout()
        }

        delete WhatsAppInstances[key]

        return res.json({
            error: false,
            message: 'Instance deleted successfully',
        })
    } catch (error) {
        console.error(error)
        return res.json({
            error: true,
            message: 'Instance deleted unsuccessfully',
            errormsg: error ? error : null,
        })
    }
}

exports.list = async (req, res) => {
    try {
        let instances = []

        if (req.query.active) {
            const db = mongoClient.db('whatsapp-api')
            const result = await db.listCollections().toArray()
            result.forEach((collection) => {
                instances.push(collection.name)
            })

            return res.json({
                error: false,
                message: 'All active instance',
                data: {
                    total: instances.length,
                    instances: instances,
                },
            })
        }

        let objInstances = Object.keys(WhatsAppInstances).map(async (key) =>
            WhatsAppInstances[key].getInstanceDetail(key)
        )

        instances = await Promise.all(objInstances)

        return res.json({
            error: false,
            message: 'All instance listed',
            data: {
                total: instances.length,
                instances: instances,
            },
        })
    } catch (error) {
        return res.json({
            error: true,
            message: 'All active instance not listed',
            data: [],
        })
    }
}
