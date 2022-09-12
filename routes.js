const adminController = require('../controller/adminController')
const login = require('../controller/login')
const logout = require('../controller/logout')
const requireAuth = require('../middleware/requireAuth')
const studentController = require('../controller/studentController')
const Joi = require('joi')
const validate = require('../middleware/validate')
const Boom = require('@hapi/boom')
const responses = require('../config/response')

module.exports = [
    //Student Admin Data
    {
        method: 'POST',
        path: '/api/studentAdmin',    
        config: {
            handler: adminController.insertData,
            auth: false,
            description: 'API for adding Admin info. ',
            notes: 'It does not require Login. Pass Email,Password,Name & Phone.',
            tags: ['admin', 'api'],
            validate: {
                payload: validate.UserJoiSchema,
                headers: Joi.object({
                    'lan': Joi.string().required().description('specify language (en-english, de-german, etc.). \n \nDefault value : en')
                }).unknown(),
                failAction(request, h, err) {
                    const res = err.hasOwnProperty('details') ? err.details[0].message : err.output.payload.message
                    
                    return Boom.badRequest(res)
                }
            },
            plugins: {
                'hapi-swagger': {
                     responses: responses.studentAdminRes
                 }
            },
        }
    },

    //Login
    {
        method: 'POST',
        path: '/api/login',
        // pre: requireAuth(),
        options: {
            handler: login.login,
            auth: false,
            description: 'API for LogIn. ',
            tags: ['authentication', 'api'],
            plugins: {
                'hapi-swagger': {
                    responses: responses.loginRes
                }
            },
            validate:{
                payload: Joi.object({
                    email:Joi.string().email().required(),
                    password: Joi.string().required()
                }),
                headers: Joi.object({
                    'lan': Joi.string().required().description('specify language (en-english, de-german, etc.). \n \nDefault value : en')
                }).unknown(),
                failAction(request, h, err) {
                    return Boom.badRequest(`${err.details[0].message}`)
                }   
            } 
        }

    },

    //Student Insert
    {
        method: 'POST',
        path: '/api/students',
        options: {
        
            handler: studentController.insertStudentInfo,
            description: 'API for Inserting Student Info After LogIn. ',
            // notes: '',
            tags: ['students', 'api'],
            validate: {
                payload: validate.StudentJoiSchema,
                failAction(request, h, err) {//
                    return Boom.badRequest(`${err.details[0].message}`)
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('authentication token of user.'),
                    'lan': Joi.string().required().description('specify language (en-english, de-german, etc.). \n \nDefault value : en')
                }).unknown()
            }, 
            plugins: {
                'hapi-swagger': {
                    responses: responses.StudentInsertRes
                }
            }
        }
    },

    //Update Student
    {
        method: 'PATCH',
        path: '/api/students/{id}',
        options: {
           
            handler: studentController.updateStudentInfo,
            description: 'API for updating Student Info After LogIn. ',
            // notes: '',
            tags: ['students', 'api'],
            validate: {
                payload: validate.StudentJoiSchema,
                failAction(request, h, err) {
                    console.log(err)
                    return Boom.badRequest(`${err.details[0].message}`)
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('authentication token of user.'),
                    'lan': Joi.string().required().description('specify language (en-english, de-german, etc.). \n \nDefault value : en')
                }).unknown(),
                params: Joi.object({
                    id: Joi.string().description('Student ID which needs to be updated.')
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: responses.StudentUpadteRes,
                }
            },
        }
    },

    //API for search all students
    {
        method: 'GET',
        path: '/api/students',
        options: {
           
            handler: studentController.getAllStudents,
            description: 'API for Searching All students ',
            notes: 'Search can done using either students name,email or phone. Or by passing above &/or below age. All keys will be passed as query params with pagination',
            tags: ['students', 'api'],
            plugins: {
                'hapi-swagger': {
                    responses: responses.GetAllStudentsRes,
                    validate: {
                        headers: Joi.object({
                            'authorization': Joi.string().required().description('authentication token of user.'),
                            'lan': Joi.string().required().description('specify language (en-english, de-german, etc.). \n \nDefault value : en')
                        }).unknown(),
                        query: Joi.object({
                            name: Joi.string().description('If wanted to search student with name. \n\n name=studentName'),
                            email: Joi.string().description('If wanted to search student with email. \n\n email=abc@example.com'),
                            phone: Joi.string().description('If wanted to search student with phone. \n\n phone="1234567890"'),
                            above: Joi.string().description('Students above specified age will be returned. \n\n above=10'),
                            below: Joi.string().description('Students below specified age will be returned. \n\n below=20'),
                            page: Joi.string().description('Page number. \n\n Default limit: 3')
                        })
                    },
                }
            },
        }
    },

    //API for getting specific student detail
    {
        method: 'GET',
        path: '/api/students/{id}',
        options: {
            
            handler: studentController.getSpecificStudent,
            description: 'API for Searching Specific student',
            notes: 'Pass student id in request params.',
            tags: ['students', 'api'],
            plugins: {
                'hapi-swagger': {
                    responses: responses.getSpecificStudentRes,
                    validate: {
                        headers: Joi.object({
                            'authorization': Joi.string().required().description('authentication token of user.'),
                            'lan': Joi.string().required().description('specify language (en-english, de-german, etc.). \n \nDefault value : en')
                        }).unknown(),
                        params: Joi.object({
                            id: Joi.string().description('Student id which is to be searched.')
                        })
                    },
                }
            }
        }
    },

    //API for deleting Students
    {
        method: 'DELETE',
        path: '/api/students',
        options: {
           
            handler: studentController.deleteStudents,
            description: 'API for Deleting student records in bulk.',
            notes: 'Student Ids to be deleted will be passed as an array in request body.',
            tags: ['students', 'api'],
            plugins: {
                'hapi-swagger': {
                    responses: responses.deleteStudentsRes,
                    validate: {
                        headers: Joi.object({
                            'authorization': Joi.string().required().description('authentication token of user.'),
                            'lan': Joi.string().required().description('specify language (en-english, de-german, etc.). \n \nDefault value : en')
                        }).unknown(),
                        payload: Joi.object({
                            ids: Joi.array().description('Student Ids which requires to be deleted.')
                        })
                    }
                }
            }
        }
    },

    //Logout
    {
        method: 'GET',
        path: '/api/logout',
        options: {
            
            handler: logout.logout,
            description: 'API for Logout',
            notes: 'Pass Valid JWT Token in Headers.',
            tags: ['authentication', 'api'],
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'This status code will be returned if User Succesfully Logs Out',
                            schema: Joi.object({
                                message: Joi.string().example('Logged Out!!!').required(),
                            })
                        },
                        401: {
                            description: 'If provided token is invalid or not provided.',
                            schema: Joi.object({
                                statusCode: Joi.number().example(401),
                                error: Joi.string().example('Unauthorized'),
                                message: Joi.string().example('Invalid token'),
                                attributes: Joi.object({ error: Joi.string().example('Invalid token') })
                            })
                        },
                    },
                    validate: {
                        headers: Joi.object({
                            'authorization': Joi.string().required().description('authentication token of user.'),
                            'lan': Joi.string().required().description('specify language (en-english, de-german, etc.). \n \nDefault value : en')
                        }).unknown()

                        // failAction(request, h, err) {
                        //     return Boom.badRequest(`${err.details[0].message}`)
                        // }
                    } 
                }
               
            }
        }
    }
]