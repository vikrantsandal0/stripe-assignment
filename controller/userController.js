let Promise        = require('bluebird');
let _              = require('underscore');
let  commonConfig  = require('../common_config');

let userServices   = require('../services/userServices');

exports.userSignup = userSignup;

function userSignup(req, res){
    let first_name = req.body.first_name;
    let last_name  = req.body.last_name;
    let email      = req.body.email;
    let password   = req.body.password;
    let phone_no   = req.body.phone_no;
    let opts={};

    Promise.coroutine(function*(){
        opts ={
            email : email
        }
        let userDetails = yield userServices.getUserDetails(opts);

        if(!_.isEmpty(userDetails)){
            return ({
                status   : commonConfig.responseFlags.SERVER_ERROR,
                message  : commonConfig.responseMessages.USER_ALREADY_EXISTS,
                data     : []
            });
        }
        opts={
            values :[first_name,last_name,email,password,phone_no]
        };
        yield userServices.insertUser(opts);
        return ({
            status  : commonConfig.responseFlags.SUCCESS,
            message : commonConfig.responseMessages.SUCCESS,
            data    :[]
        })
    })().then((result)=>{
        return res.status(200).send({status:result.status,message:result.message,data:result.data});
    },(error)=>{
        return res.status(400).send({status:commonConfig.responseFlags.NO_DATA_SUCCESS,message:error});
    });
}