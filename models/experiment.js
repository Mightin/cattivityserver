// grab the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a schema
var experimentSchema = new Schema({
    values: [Number],
    time: Number
});

// the schema is useless so far
// we need to create a model using it
var experiment = mongoose.model('experiment', experimentSchema);

// make this available to our users in our Node applications
module.exports = experiment;