const Joi = require('joi')
const db = require('../db/conn')

// function validateUser(user) {
    // console.log('validate')

    const validateUniqueEmail = async (email) => {

        const isEmailExsists = await db.get().collection('studentAdmin').find({ email: email }).toArray()
        if (isEmailExsists.length)
            throw new Error('This email is aleady in use. Please Enter another email.')
        
    }

    const UserJoiSchema = Joi.object({

        email: Joi.string()
            .email()
            .external(validateUniqueEmail)
            .required(),

        password: Joi.string()
            .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,15}$/)
            .error(() => {
                    throw new Error('Password must be between 6 to 15 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character')
            })
            .required(),
            
        name: Joi.string()
            .required(),

        phone: Joi.string()
            .optional(),
    }).options({ abortEarly: false })

    // return JoiSchema.validate(user)
// }

// function validateStudent(student) {
    // console.log('validate')
    const StudentJoiSchema = Joi.object().keys({
        name: Joi.string()
            .required(),

        email: Joi.string()
            .email()
            .min(5)
            .max(15)
            .required(),

        phone: Joi.string()
            .optional(),

        //string or array of strings , items of array must be a string
        preferedSubject: Joi.alternatives().try(
            Joi.string(),
            Joi.array().items(Joi.string())
        ),

        age: Joi.number().required(),

        isPresent: Joi.boolean().valid(true,false,0,1).required(),

        addmission_date: Joi.date().less('now').required(),

        leaving_date: Joi.date().greater(Joi.ref('addmission_date')).required(),

        contact_person_details: Joi.object({
            // "relation": Joi.string().required()
            "contact": Joi.string().required()
        }).unknown().description('anything'),

        //If student is present then take Entry & exit timing
        timing: Joi.object().when('isPresent',{
            is: Joi.alternatives().try(
                true,
                1
            ),
            then: Joi.object({
                "entry_time": Joi.string().regex(/^([0-9]{2})\:([0-9]{2})$/),
                "exit_time": Joi.string().regex(/^([0-9]{2})\:([0-9]{2})$/)
            }).required()
        }),

        "extraInfo": Joi.any().description('this key will match anything you give it')

    }).options({ abortEarly: false });

    // return JoiSchema.validate(student)
// }

module.exports = { UserJoiSchema, StudentJoiSchema }