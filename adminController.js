const dbConnect = require('../db/conn')
const validate = require('../middleware/validate')
let md5 = require('md5')
const jwt = require('jsonwebtoken')
const db = require('../db/conn')
require('dotenv').config()
const i18n = require('i18n')



module.exports = {
    //Insert Data in studentsAdmin
    insertData: async (req, h) => {
        try {
            i18n.setLocale(req.headers['lan'])
            let res = 'Error'
            // const isValid = validate.validateUser(req.payload)
            // console.log(isValid.error)

            // if (!isValid.error) {
                req.payload.password = md5(req.payload.password) 
                let result = await db.get().collection('studentAdmin').insertOne(req.payload)
                // res = result.acknowledged ? "Data Inserted!!" : 'An error occured'
                return h.response({ message: i18n.__('admin.message') }).code(201)
            // }
            // else {
            //     res = isValid.error.details[0].message
            //     return h.response({ message: res }).code(409)
            // }

            // return res
        }
        catch (e) {
            console.log(e)
        }
    }
}