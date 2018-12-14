/*
Created by bharat bagga on March 30, 2018
 */

exports.responseMessages = {
    SUCCESS                     : "Successful",
    ACCOUNT_NOT_REGISTERED      : "ACCOUNT NOT REGISTERED",
    SIZE_EXCEEDS                : "SIZE_EXCEEDS",
    UPLOAD_ERROR                : "UPLOAD_ERROR",
    NO_VEHICLE_MATCH            : "No vehicle matched your load. Try spliting your loads or contact Admin on 1855.733.7525",
    NO_PATH_FOUND               : "No path found between source and destination.",
    NO_CSV_ATTACHED             : "NO CSV ATTACHED!!",
    PARAMETER_MISSING           : "Parameter missing or parameter type is wrong",
    SERVER_ERROR                : "Some error occoured! Please contact the support team.",
    INVALID_CREDENTIALS         : "Invalid Credentials Provided",
    UNAUTHORIZED                : "Unauthorized! Session Expired. Please Login again",
    INCORRECT_OLD_PASSWORD      : "Incorrect old password",
    ACCESSORY_ALREADY_EXISTS    : "Accessory with same details already exists in this city!. Try updating it",
    CITY_ALREADY_EXISTS         : "City with same name already exists!. Try updating it",
    CONTACT_ALREADY_EXISTS      : "Contact with same name already exists!. Try updating it",
    DUPLICATE_ENTRIES           : "Entries having Duplicate columns. Please recheck and upload.",
    MISSING_COLUMNS             : "Uploaded CSV has missing columns.Please recheck and upload.",
    MISSING_REQUIRED_DATA       : "Uploaded CSV has missing required data.Please recheck and upload.",
    LOAD_ALREADY_EXISTS         : "Load type with same name already exists!. Try updating it",
    VEHICLE_ALREADY_EXISTS      : "Vehicle with same name already exists in this city!. Try updating it",
    COADMIN_ALREADY_EXISTS      : "Co-admin with same email already exists",
    EMAIL_ALREADY_EXISTS        : "This email is already registered with us. Try signing in",
    EMAIL_NOT_REGISTERED        : "This email is not registered with us.",
    EMAIL_NOT_VERIFIED          : "This email is not verified. Please verify your email and try again",
    EMAIL_ALREADY_VERIFIED      : "This email is already verified. Please continue logging in.",
    EMAIL_BLOCKED               : "This email is blocked by admin",
    NO_USER_FOUND               : "No User found for this User Id",
    INVALID_TOKEN               : "The provide Stripe Token is Invalid",
    NO_CARD_FOUND               : "No card found for this user",
    CARD_ADDING_ERROR           : "There was some error while adding the card",
    NO_QUOTE_fOUND              : "No quote found for this quote id",
    INVALID_SERVICE_TYPE        : "Invalid service type",
    INVALID_USER_ID            : "Invalid User Id",
    CANCEL_CHECK                : "You can't cancel a booking once pickup has started.",
    EDIT_CHECK                  : "You  cannot edit  a booking.",
    DUPLICATE_CARD_ENTRY        : "You are adding the card which is already there",
    PAYMENT_METHOD_NOT_ALLOWED  : "You are not allowed to use this payment method for respective payer.",
    NO_ACCESS_FOR_YOU           : "You are not allowed to use this functionality.",
    INVALID_DATE_FORMAT         : "You are providing invalid date",
    TIME_CHECK                  : "start time is greater than end time",
    USER_ALREADY_EXISTS         : "USER ALREADY EXIST",
    INVALID_USERS               : "INVALID USERS",
    INVALUD_JOB_ID              : "INVALID JOB_ID",
    NO_KEY                      : "NO KEY",
    REGISTER_FIRST              : "REGISTER FIRST"
}

exports.responseFlags = {
    SUCCESS:           200,
    NO_DATA_SUCCESS:   201,
    PARAMETER_MISSING: 400,
    SERVER_ERROR:      503,
    UNAUTHORIZED:      400,
    EMAIL_NOT_VERIFIED:301
};

exports.bookingPayer = {
    SHIPPER:            1,
    RECIEVER:           2,
    THIRD_PARTY:        3
};

exports.paymentMode = {
    STRIPE:            1,
    ACCOUNT:           2
};














































   



