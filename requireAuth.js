const jwt = require('jsonwebtoken')
require('dotenv').config()
const Boom = require('@hapi/boom')
const mongodb = require('mongodb')
const db = require('../db/conn')

const requireAuth = async (decodedToken,req, res) => {

    try {
            // console.log(decodedToken)
            if (decodedToken) {
                const data = await db.get().collection('auth').aggregate([
                    {
                        $match: {
                            user: mongodb.ObjectId(decodedToken.payload.user),
                            access_token: decodedToken.payload.access_token
                        }
                    }
                ]).toArray()

                // console.log(data)
                if (data.length) {
                    // console.log("in if")
                    return { isValid: true }
                }
                else {
                    // console.log("in else")
                    // return Boom.unauthorized('Unauthorized')
                    return { isValid: false }
                }
            }
            else
                // return Boom.unauthorized('Unauthorized')  
                return { isValid: false }          
        
    } catch (e) {
        console.log(e)
        // return Boom.unauthorized('Unauthorized')
        return { isValid: false }
    }

}

module.exports = { requireAuth }