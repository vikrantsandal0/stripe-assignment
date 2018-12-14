let Joi                = require('joi');
var commonConfig                =    require('../common_config');

exports.validateFields = validateFields;

function validateFields( req, res, schema){    
    let validation =Joi.validate(req,schema);
    if(validation.error) {
        let errorReason =
            validation.error.details !== undefined
                ? validation.error.details[0].message
                : 'Parameter missing or parameter type is wrong'; 
                res.status(200).send({status:commonConfig.responseFlags.NO_DATA_SUCCESS, message: "ERROR VALIDATING FIELDS", data: errorReason}); 
                return false;                       
    }
    return true;
}