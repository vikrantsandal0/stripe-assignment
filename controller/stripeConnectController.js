let Promise                        = require('bluebird');
let _                              = require('underscore');
const stripe_mod                   = require('stripe');

let stripeService                  = require('../services/stripeServices');
const connection                   = require('../connection/mysql');
const mongoConnection              = require('../connection/mongo');
var commonConfig                    =    require('../common_config');

exports.get_account    = get_account;
exports.registerStripeAccount               = registerStripeAccount;
exports.send_balance            = send_balance;

function registerStripeAccount(req,res){
    let user_id                       = req.body.user_id;
    let maerketplace_user_id          = req.body.maerketplace_user_id;

    let city                          = req.body.city;
    let line1                         = req.body.line1;
    let first_name                    = req.body.first_name;
    let last_name                     = req.body.last_name;
    let line2                         = req.body.line2;
    let personal_postal_code          = req.body.personal_postal_code;
    let state                         = req.body.state;
    let dob_day                       = req.body.dob_day;
    let dob_month                     = req.body.dob_month;
    let dob_year                      = req.body.dob_year;
    let bank_account_country          = req.body.bank_account_country;
    let bank_account_currency         = req.body.bank_account_currency;
    let bank_account_number           = req.body.bank_account_number;
    let bank_name                     = req.body.bank_name;
    let branch_name                   = req.body.branch_name;
    let phone_no                      = req.body.phone_no;
    let file_token                    = req.body.file_token;
    let personal_id_number            = req.body.personal_id_number;
    let country                       = req.body.country;
    let routing_number                = req.body.routing_number;
    let bank_account_type             = req.body.bank_account_type;        
    let ip                            = req.body.ip || "167.99.93.3" ;
    let business_name                 = req.body.business_name;           
    let business_tax_id               = req.body.business_tax_id;           
    let ssn                           = req.body.ssn;
    let accountDetails;
    let opts ={};
    let stripe;
    let stripeKeyResult;
    let stripe_account;
    let account_details;
    let account_status;
    let getConnection;

    Promise.coroutine(function*(){
        
         getConnection  = yield connection.getConnectionForTransaction();

        yield connection.beginTransaction(getConnection);

        let result  = yield stripeService.getAccountDetails(user_id,getConnection);

        if(!_.isEmpty(result)){
            yield connection.rollbacktransaction(getConnection);
            return ({
                status  : commonConfig.responseFlags.SERVER_ERROR,
                message : commonConfig.responseMessages.USER_ALREADY_EXISTS,
                data    : []
            });
        }
        if(ip){
            try{
                ip =JSON.parse(ip);              
            }catch(e) {}
        }
        stripeKeyResult  = yield stripeService.getStripeKeys(maerketplace_user_id,getConnection);
        stripe= stripe_mod(stripeKeyResult[0]['private_key']);

        stripe_account ={
            object          : "bank_account",
            country         : bank_account_country,
            currency        : bank_account_currency,
            account_number  : bank_account_number
        }

        if(routing_number) {
            stripe_account.routing_number = routing_number;
        }

        let legal_entity = {
            first_name       : first_name,
            last_name        : last_name,
            type             : bank_account_type,
            dob   : {
                day          : dob_day,
                month        : dob_month,
                year         : dob_year
            }
        }

        if(bank_account_type == "individual") {
            legal_entity.address = {
                state       : state,
                city        : city,
                line1       : line1,
                postal_code : personal_postal_code
              };
              if(line2){
                legal_entity.address.line2 = line2;
              }
              legal_entity.ssn_last_4  = ssn.slice(ssn.toString().length-4 ,ssn.toString().length);
        }

        if(bank_account_type == "company") {
            legal_entity.address = {
                state       : state,
                city        : city,
                line1       : line1,
                postal_code : personal_postal_code
              };
              if(line2){
                legal_entity.address.line2 = line2;
              }
              legal_entity.business_name   = business_name;
              legal_entity.business_tax_id = business_tax_id;
              legal_entity.ssn_last_4      = ssn.slice(ssn.toString().length-4 ,ssn.toString().length);
        }
        account_details = yield stripe.accounts.create({
            country         : country,
            type            : "custom",
            tos_acceptance  : {
              date : Math.floor(Date.now() / 1000),
              ip   : ip
            },
            debit_negative_balances : true,
            legal_entity : legal_entity,
      
             payout_schedule : {
                delay_days  : 2,
                interval    : "daily"
             },
            metadata : {
              account_type         : "merchant",
              user_id              : user_id
            },
            external_account  : stripe_account
        });
        let verification_status = yield stripeService.checkVerificationStatus(account_details.legal_entity.verification.status);
        if(verification_status) {
            account_status = verification_status;
        } else { 
            yield connection.rollbacktransaction(getConnection);
            return({
                status  : commonConfig.responseFlags.SERVER_ERROR,
                message : commonConfig.responseMessages.SERVER_ERROR,
                data    : []
            });
        }

        opts={
            values : [user_id, account_details.id, account_status, bank_account_currency, JSON.stringify(account_details)]
        }

        yield stripeService.setStripeAccDetails(opts,getConnection);
        yield connection.commitTransaction(getConnection);

        delete req.body.personal_id_number;
        delete req.body.bank_account_number;
        delete req.body.business_tax_id;
        delete req.body.ssn;

        opts={
            values : [user_id, JSON.stringify(req.body)]
        };

        stripeService.dataSendToStripe(opts, getConnection);

        return ({
            status  : commonConfig.responseFlags.SUCCESS,
            message : commonConfig.responseFlags.SUCCESS,
            data    : []
        });
    })().then((result)=>{
        return res.status(200).send({status:result.status,message:result.message,data:result.data});
    },(error)=>{        
          connection.rollbacktransaction(getConnection);
        return res.status(400).send({status: commonConfig.responseFlags.NO_DATA_SUCCESS,message:error.message ? error.message : error});
    })
}
function get_account(req, res){
    let marketplace_user_id  = parseInt(req.body.marketplace_user_id);
    let user_id               = req.body.user_id;
    let userStripeKeysResult;
    let stripe_account_number;
    let acc_details;
    let account_status;
    let stripe;
    let where;
    let opts;
    let dataSendToStripeBody;
    let getConnection;

    Promise.coroutine(function*(){
         getConnection = yield connection.getConnectionForTransaction();
        yield connection.beginTransaction(getConnection);
        let acc_data   = yield stripeService.getAccountDetails(user_id,getConnection);
        if(_.isEmpty(acc_data)){
            return ({
                status  : commonConfig.responseFlags.SERVER_ERROR,
                message : commonConfig.responseMessages.ACCOUNT_NOT_REGISTERED,
                data    : []
            });
        }
        stripe_account_number = acc_data[0]['stripe_account_number'];
        userStripeKeysResult  = yield stripeService.getStripeKeys(marketplace_user_id,getConnection);
        
        if(_.isEmpty(userStripeKeysResult)){
            return ({
                status  : commonConfig.responseFlags.SERVER_ERROR,
                message : commonConfig.responseMessages.INVALID_USERS,
                data    : []
            });
        }
        stripe   = stripe_mod(userStripeKeysResult[0]['private_key']);

        acc_details = yield stripe.accounts.retrieve(stripe_account_number);

        let verification_status = yield stripeService.checkVerificationStatus(acc_details.legal_entity.verification.status);

        if(verification_status) {
            account_status = verification_status
        } else { 
            return ({
                status  : commonConfig.responseFlags.SERVER_ERROR,
                message : commonConfig.responseMessages.SERVER_ERROR
            });
        }    
        
        if(acc_details.legal_entity.verification.status != acc_data[0]['account_status']) {            
            opts    = { account_status : account_status };
            where   = {user_id : user_id };
            yield stripeService.updateStripeAccDetails(opts,where,getConnection);
        }
        opts ={
            user_id : user_id
        }
        let dataSendToStripe = yield stripeService.getStroreFrontDetails(opts, getConnection);   
        
        try {
            dataSendToStripe = JSON.parse(dataSendToStripe[0].req_body)
        } catch (e) {}     

        let finalData = {
            acc_status : verification_status,
            account    : {
              first_name              : acc_details.legal_entity.first_name,
              last_name               : acc_details.legal_entity.last_name,
              city                    : acc_details.legal_entity.address.city,
              line1                   : acc_details.legal_entity.address.line1,
              personal_postal_code    : acc_details.legal_entity.address.postal_code,
              routing_number          : acc_details.external_accounts.data[0].routing_number,
              dob_day                 : acc_details.legal_entity.dob.day,
              dob_month               : acc_details.legal_entity.dob.month,
              dob_year                : acc_details.legal_entity.dob.year,
              bank_account_country    : acc_details.external_accounts.data[0].bank_account_country,
              bank_account_currency   : acc_details.external_accounts.data[0].bank_account_currency,
              country                 : acc_details.legal_entity.address.country,
              bank_account_type       : acc_details.legal_entity.type,
              business_name           : acc_details.legal_entity.business_name,
              line2                   : acc_details.legal_entity.address.line2,
              bank_account_number     : acc_details.external_accounts.data[0].last4,             
              phone_no                : acc_details.legal_entity.phone_number,
              bank_name               : dataSendToStripe.bank_name,
              branch_name             : dataSendToStripe.branch_name,
              state                   : acc_details.legal_entity.address.state,
              personal_address_city   : acc_details.legal_entity.personal_address.city,
              personal_address_line1  : acc_details.legal_entity.personal_address.line1,
              personal_address_postal_code : acc_details.legal_entity.personal_address.postal_code,
              business_vat_id         : acc_details.legal_entity.business_vat_id,
              personal_id_number      : acc_details.legal_entity.personal_id_number,
              additional_owners       : []
            }
        };
        yield connection.commitTransaction(getConnection);

        return ({
            status  : commonConfig.responseFlags.SUCCESS,
            message : commonConfig.responseMessages.SUCCESS,
            data    : finalData
        });
    })().then((result)=>{
        return res.status(200).send({status:result.status,message:result.message,data:result.data});
    },(error)=>{        
        connection.rollbacktransaction(getConnection);
        return res.status(400).send(error);
    });
}

function send_balance(req, res){
    let job_id               = req.body.job_id;
    let marketplace_user_id     = req.body.marketplaces_user_id;
    let user_id              = req.body.user_id;
    let percentage           = req.body.percentage;
    let opts={};
    let amount;
    let connectionInstance;

    Promise.coroutine(function*(){
        opts ={
            job_id: job_id,

        };
        connectionInstance = yield connection.getConnectionForTransaction();
        yield connection.beginTransaction(connectionInstance);

        let jobDetails = yield stripeService.getJobDetails(opts);

        if(_.isEmpty(jobDetails)){
            return ({
                status  : commonConfig.responseFlags.SERVER_ERROR,
                message :commonConfig.responseMessages.INVALUD_JOB_ID,
                data    : []
            });
        }
        amount = jobDetails[0].amount;
        let transaction_id = jobDetails[0].charge_id;
        let transferAmount = Number((amount*percentage)/100);
        opts={
            charge_id : transaction_id,
            amount    : transferAmount,
            user_id   : user_id,
            marketplace_user_id  : marketplace_user_id
        }

        let result = yield stripeService.stripeTransfer(opts,connectionInstance);;

        yield connection.commitTransaction(connectionInstance);
        
       let insertobj={
            type : "TRANSFER",
            user_id : user_id,
            result : result
        };
        mongoConnection.storeHistory(insertobj);     
        return ({
            status : commonConfig.responseFlags.SUCCESS,
            message : commonConfig.responseMessages.SUCCESS,
            data :[]
        })   

    })().then((result)=>{
        return res.status(200).send({status:result.status,message:result.message,data:result.data});
    },(error)=>{
        console.log("err isss",error);
        connection.rollbacktransaction(connectionInstance);
        return res.status(400).send(error);
    })
}