// grab the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a schema
var fingerprintSchema = new Schema({
    place: String,
    value: Number,
    phoneID: String
});

// the schema is useless so far
// we need to create a model using it
var fingerprint = mongoose.model('fingerprint', fingerprintSchema);

// make this available to our users in our Node applications
module.exports = fingerprint;