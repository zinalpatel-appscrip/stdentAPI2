let md5 = require('md5')
const jwt = require('jsonwebtoken')
const db = require('../db/conn')
const i18n = require('i18n')


module.exports = {
    
    login: async function name(req,h) {
        i18n.setLocale(req.headers['lan'])
        //check if email exists in db
        const isEmailExists = await db.get().collection('studentAdmin').find({email: req.payload.email}).toArray()
        if(isEmailExists.length)
        {
            //check if password is correct
            req.payload.password = md5(req.payload.password) 
            const user = await db.get().collection('studentAdmin').find({ email: req.payload.email , password: req.payload.password }).toArray()
            if (user.length) {
                const token = await generateToken(user)
                return h.response({ message: i18n.__('login.200.message'), token: token }).code(200)
            }
            else
                return h.response({ message: i18n.__('login.401.message') }).code(401)
        }
        else   
            return h.response({ message: i18n.__('login.401.message') }).code(401)
    }
}

async function generateToken(user) {

    const random_access_token = Math.random().toString(36).substr(2)
    try{
        const payload = {
            user: user[0]._id,
            date: Date(),
            access_token: random_access_token
        }
    
        //save payload
        db.get().collection('auth').replaceOne(
                {user: user[0]._id},
                {
                    user: user[0]._id,
                    date: Date(),
                    access_token: random_access_token
                },
                {upsert: true}            
        )
    
        return jwt.sign({ payload }, process.env.SECRET_KEY, {
            expiresIn: 3 * 60 * 60
        })
    }
    catch(e)
    {
        console.log(e)
    }
}