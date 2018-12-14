let Joi                  =  require('joi');

let validator            = require('./validate');

exports.createCharges     = createCharges;

function createCharges(req, res, next){
    let schema = Joi.object().keys({
        card_number         : Joi.string().options({convert : false}).required(),
        exp_month           : Joi.string().options({convert : false}).required(),
        exp_year            : Joi.string().options({convert : false}).required(),
        cvc                 : Joi.string().options({convert : false}).required(),
        user_id             : Joi.number().options({convert : false}).required(),
        marketplace_user_id : Joi.number().options({convert : false}).required(),
        email               : Joi.string().options({convert : false}).required(),
        amount              : Joi.number().options({convert : false}).required(),
        job_id              : Joi.number().options({convert : false}).required()
    });
    let validFields  = validator.validateFields(req.body, res, schema);
    if (validFields) {
        next();
    }
}