const User = require('../models/user')
const Message = require('../models/message')


class MessagesController {

    async create(req, res) {
        try {
            const message = await new Message({
               message: req.body.message,
               employee: req.body.employeeId,
               client: req.body.clientId,
               sendBy: req.body.sendBy,
               session: req.body.session,
           })
           .save()
           .then(m => m.populate('client').execPopulate())
           .then(m => m.populate('employee').execPopulate())

           return res.status(200).json(message)

        } catch (e) {
            return res.status(400).json({message: 'error' + e})
        }
    }

    async get(req, res) {
        try {
            const session1 = req.query.userId + req.query.interlocutorId
            const session2 = req.query.interlocutorId + req.query.userId

            const messages = await Message.find(
                { $or : [{session: session1}, {session: session2}] }
            ).populate('employee').populate('client')

           return res.status(200).json(messages)
        } catch (e) {
            return res.status(400).json({message: 'error' + e})
        }
    }

    async update(req, res) {
        try {
            const session1 = req.body.userId + req.body.interlocutorId
            const session2 = req.body.interlocutorId + req.body.userId

            const message = await Message.findOneAndUpdate(
                { $or : [{session: session1}, {session: session2}] },
                { $set: { readed: true } },
                { new: true }
            )

            const messages = await Message.find(
                { readed : false, $or : [{employee: req.body.userId }, { client: req.body.userId}] }
            ).populate('employee').populate('client')

           return res.status(200).json({message, messages})

        } catch (e) {
            return res.status(400).json({message: 'error' + e})
        }
    }

}

module.exports = function() {
    return new MessagesController()
}