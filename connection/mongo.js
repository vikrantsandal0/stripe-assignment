exports.initializeConnection = initializeConnection;
exports.getTokanData = getTokanData;
exports.storeHistory = storeHistory;
exports.updateTokansData = updateTokansData;


function initializeConnection() {

    const MongoClient = require('mongodb').MongoClient;
    const assert = require('assert');
    const url = 'mongodb://localhost:27017';
    const dbName = 'payments';

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        assert.equal(null, err);
        const dbo = client.db(dbName);
        global.db = dbo;
    });

}

function storeHistory(insertObj) {
    return new Promise((resolve, reject) => {
        db.collection('payments_history').insertOne(insertObj, function (err, result) {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}

function getTokanData(findObj) {
    return new Promise((resolve, reject) => {
        db.collection('stripe_tokan').findOne(findObj, function (err, result) {
            if (err) {
                return reject(err);
            }
            return resolve(result);
        })
    })
}

function updateTokansData(findObj, updateObj) {
    return new Promise((resolve, reject) => {
        db.collection('stripe_tokan').updateOne(findObj, { $set: updateObj }, { upsert: true }, function (err, result) {
            if (err) {
                return reject(err);
            }
            return resolve();
        })
    })
}