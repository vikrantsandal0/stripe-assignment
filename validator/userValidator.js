let Joi                  = require('joi');

let validator            = require('./validate');

exports.userSignup       = userSignup;

function userSignup(req,res, next){
    let schema = Joi.object().keys({
        email      : Joi.string().options({convert : false}).required(),
        first_name : Joi.string().options({convert : false}).required(),
        last_name  : Joi.string().options({convert : false}).required(),
        phone_no   : Joi.string().options({convert : false}).required(),
        password   : Joi.string().options({convert : false}).required()
    });

    let validFields  = validator.validateFields(req.body, res, schema);
    if (validFields) {
        next();
    }
}