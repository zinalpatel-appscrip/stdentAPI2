const jwt = require('jsonwebtoken')
const Boom = require('@hapi/boom')
const mongodb = require('mongodb')
const db = require('../db/conn')
const i18n = require('i18n')

module.exports = {
    logout : async (req, res) => {

        try {
            i18n.setLocale(req.headers['lan'])
            const token = req.headers.authorization
            if (token) {
                const decodedToken = await jwt.verify(token, process.env.SECRET_KEY)
                if (decodedToken) {
                    const result = await db.get().collection('auth').deleteOne(
                        {
                            user: mongodb.ObjectId(decodedToken.payload.user),
                            access_token: decodedToken.payload.access_token
                        }
                    )

                    if (result.deletedCount === 1) {
                        return res.response({ message: i18n.__('logout.200.message') }).code(200)
                    }
                    else {
                        return Boom.unauthorized('Unauthorized')
                    }
                }
                else
                    return Boom.unauthorized('Unauthorized')
            }
            else {
                return Boom.unauthorized('Unauthorized')
            }
        } catch (e) {
            console.log(e)
        }

    }
}
