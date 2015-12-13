// grab the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a schema
var placeSchema = new Schema({
    place: String,
    values: [Number],
    time: Number
});

// the schema is useless so far
// we need to create a model using it
var place = mongoose.model('place', placeSchema);

// make this available to our users in our Node applications
module.exports = place;