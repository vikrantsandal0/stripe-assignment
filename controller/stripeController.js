let Promise              = require('bluebird');
let _                    = require('underscore');

let stripeServices       = require('../services/stripeServices');
let userServices         = require('../services/userServices');
let connection           = require('../connection/mysql');
let mongoConnection      = require('../connection/mongo');
let  commonConfig        = require('../common_config');

exports.createCharges     = createCharges;

function createCharges(req,res){
    let user_id               = req.body.user_id;
    let marketplace_user_id   = req.body.marketplace_user_id;
    let card_number           = req.body.card_number;
    let exp_month             = req.body.exp_month;
    let exp_year              = req.body.exp_year;
    let cvc                   = req.body.cvc;
    let email                 = req.body.email;
    let amount                = req.body.amount;
    let job_id                = req.body.job_id;
    let connectionInnstance;
    let opts={};

    Promise.coroutine(function*(){
        opts={
            user_id : user_id,
            email   : email
        }
        let userDetail = yield userServices.getUserDetails(opts);

        if(_.isEmpty(userDetail)){
            return ({
                status   : commonConfig.responseFlags.NO_DATA_SUCCESS,
                message  : commonConfig.responseMessages.INVALID_USER_ID,
                data     : userDetail
            });
        } 
              
        connectionInnstance  = yield connection.getConnectionForTransaction();
        yield connection.beginTransaction(connectionInnstance);        
        
        let stripeKeys = yield stripeServices.getStripeKeys(marketplace_user_id,connectionInnstance);
        
        if(_.isEmpty(stripeKeys)){
            return({
                status  : commonConfig.responseFlags.SUCCESS,
                message : commonConfig.responseMessages.INVALID_USER_ID,
                data    : []
            });
        }
        opts={
            card_number  : card_number,
            exp_month    : exp_month,
            exp_year     : exp_year,
            cvc          : cvc
        }
        let tokenId  = yield stripeServices.getToken(opts,stripeKeys[0].private_key);
        amount = amount.toFixed(2)
        opts={
            amount  : amount,
            token   : tokenId,
            email   : email
        }
        
        let chargeDetails  = yield stripeServices.createCharge(opts,stripeKeys[0].private_key);

        opts={
            values :[job_id,user_id,amount,chargeDetails.id]
        };

        yield stripeServices.insertJobDetails(opts,connectionInnstance)

        opts={
            charge_id  : chargeDetails.id,
            job_id     : job_id,
            user_id    : marketplace_user_id,
            amount     : amount,
            response   : chargeDetails
        }

        mongoConnection.storeHistory(opts);

        yield connection.commitTransaction(connectionInnstance);       

        return ({
            status : commonConfig.responseFlags.SUCCESS,
            message : commonConfig.responseMessages.SUCCESS,
            data   : `YOUR ORDER_ID IS ${chargeDetails.id}`
        });
    })().then((result)=>{
        return res.status(200).send({status:result.status,message:result.message,data:result.data});
    },(error)=>{        
         connection.rollbacktransaction(connectionInnstance);
        return res.status(400).send({status:commonConfig.responseFlags.NO_DATA_SUCCESS,message:error});
    });
}
