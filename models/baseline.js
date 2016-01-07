// grab the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a schema
var baselineSchema = new Schema({
    placeID: Number,
    run: Number,
    averages: [Number],
    phoneValues: [{values: [Number]}],
    x: Number,
    y: Number,
    phonesUsed: Number
});

// the schema is useless so far
// we need to create a model using it
var baseline = mongoose.model('baseline', baselineSchema);

// make this available to our users in our Node applications
module.exports = baseline;