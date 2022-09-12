const db = require('../db/conn')
const validate = require('../middleware/validate')
const mongodb = require('mongodb')
const i18n = require('i18n')


module.exports = {
    insertStudentInfo: async (req, h) => {
        try {
            i18n.setLocale(req.headers['lan'])
            //validate student info
            let res = 'Error'
            // const isValid = validate.validateStudent(req.payload)

            // if (!isValid.error) {
                const result = await db.get().collection('studentInfo').insertMany([req.payload])
                // res = result.acknowledged ? "Student Created!!" : 'An error occured'
            return h.response({ message: i18n.__('student.insert.201.message') }).code(201)
            // }
            // else {
            //     res = isValid.error.details[0].message
            //     return h.response({ message: res }).code(409) //Conflict
            // }

        } catch (e) {
            console.log(e)
        }
    },
    //Update Student
    updateStudentInfo: async (req, h) => {
        i18n.setLocale(req.headers['lan'])
        try {
            let res = 'Error'
            //check if resouse exsists
            let data = await db.get().collection('studentInfo').findOne({ _id: mongodb.ObjectId(req.params.id) })
            // console.log(data)
            if (data) {
                // const isValid = validate.validateStudent(req.payload)
                // if (!isValid.error) {
                    let result = await db.get().collection('studentInfo').updateOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.payload })
                    // res = 'Data Updated!!'
                return h.response({ message: i18n.__('student.update.200.message') }).code(200)
                // }
                // else {
                //     res = isValid.error.details
                //     return h.response({ message: res }).code(409) //Conflict
                // }
            }
            else {
                res = 'requested student not found'
                return h.response({ message: i18n.__('student.update.404.message') }).code(404)
            }

        }
        catch (e) {
            console.log(e)
        }
    },
    //search all students with filter
    getAllStudents: async (req, h) => {
        i18n.setLocale(req.headers['lan'])
        try {
            // const data = req.params.filter
            const name = req.query.name
            const email = req.query.email
            const phone = req.query.phone
            let above = req.query.above
            let below = req.query.below

            // console.log(age)
            if (name || email || phone) {
                let result = await db.get().collection('studentInfo').aggregate([
                    {
                        $match: {
                            $or: [{ name: name }, { email: email }, { phone: phone }]
                        }
                    }
                ]).toArray()

                return h.response({ message: i18n.__('student.getAll.200.message') , data: result }).code(200)
            }

            if (above || below) {

                if (!above) above = 0
                if (!below) below = Number.MAX_SAFE_INTEGER

                let result = await db.get().collection('studentInfo').aggregate([
                    {
                        $match: {
                            $and: [{ age: { $gt: Number(above) } }, { age: { $lt: Number(below) } }]
                        }
                    },
                    {
                        $skip: (req.query.page - 1) * 3 //per page 3 records
                    },
                    {
                        $limit: 3
                    }
                ]).toArray()

                return h.response({ message: i18n.__('student.getAll.200.message'), data: result }).code(200)
            }

        } catch (e) {
            console.log(e)
        }


    },
    getSpecificStudent: async (req, h) => {
        i18n.setLocale(req.headers['lan'])
        try {
            const id = req.params.id

            const student = await db.get().collection('studentInfo').find({
                _id: mongodb.ObjectId(id)
            }).toArray()

            if (student.length)
                return h.response({ message: i18n.__('student.getSpecific.200.message'),data: student }).code(200)
            else
                return h.response({ message: i18n.__('student.getSpecific.404.message') }).code(404)
        } catch (e) {
            console.log(e)
        }
    },
    //delete students
    deleteStudents: async (req, h) => {
        i18n.setLocale(req.headers['lan'])
        const ids = req.payload.ids

        let objectids = ids.map(id => mongodb.ObjectId(id))
        const result = await db.get().collection('studentInfo').deleteMany({ _id: { $in: objectids } })

        if(result.deletedCount)
            return h.response({ message: i18n.__('student.delete.200.message') }).code(200)
        else if (result.deletedCount === 0)
            return h.response({ message: i18n.__('student.delete.404.message') }).code(404)
        else
            return h.response({ message: i18n.__('student.delete.500.message') }).code(500)
    }
}