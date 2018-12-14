
/**created by -vikrant sandal */

let express                 = require('express');
let bodyParser              = require('body-parser');

let connection          = require('./connection/mysql');
let mongoConnect            = require('./connection/mongo');
let connectValidator  = require('./validator/stripeConnectValidator');
let stripeValidator         = require('./validator/stripeValidator');
let userValidator           = require('./validator/userValidator');
let connectContrller = require('./controller/stripeConnectController');
let stripeController        = require('./controller/stripeController');
let userController          = require('./controller/userController');

let app  = express();
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
let server = require('http').createServer(app);
let PORT = 3000 || process.env.PORT


app.post('/register_account', connectValidator.registerStripeAccount,  connectContrller.registerStripeAccount);
app.post('/get_account', connectValidator.get_account, connectContrller.get_account);
app.post('/send_balance', connectValidator.send_balance, connectContrller.send_balance);
app.post('/signup', userValidator.userSignup, userController.userSignup);
app.post('/create_charge', stripeValidator.createCharges, stripeController.createCharges);


server.listen(PORT,()=>{
    connection.connect_mysql();
    mongoConnect.initializeConnection();
    console.log("server has started on ",PORT);
})
