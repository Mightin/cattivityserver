var express = require('express');
var d3 = require('d3');
var async = require('async');

var router = express.Router();
var check = require("check-type").init();

var Fingerprint = require('../models/fingerprint');

var phones = [
    {place: "Kitchen", id: 1, x: 230, y: 175},
    {place: "Livingroom", id: 2, x: 700, y: 80},
    {place: "Bedroom", id: 3, x: 560, y: 530}
];

var locations = [
    {place: "Food Bowl", id: 1, x: 64, y: 106, values: [1, 2, 3]},
    {place: "Kitchen Hood", id: 2, x: 208, y: 198, values: [1, 2, 3]},
    {place: "Kitchen Table", id: 3, x: 58, y: 286, values: [1, 2, 3]},
    {place: "Kitchen Shelves", id: 4, x: 66, y: 350, values: [1, 2, 3]},
    {place: "Kitchen Closet", id: 5, x: 218, y: 344, values: [1, 2, 3]},
    {place: "Bathroom Litterbox", id: 6, x: 328, y: 182, values: [1, 2, 3]},
    {place: "Bathroom Sink", id: 7, x: 420, y: 106, values: [1, 2, 3]},
    {place: "Hall, By Shoes", id: 29, x: 292, y: 358, values: [1, 2, 3]},
    {place: "Hall Door", id: 8, x: 376, y: 342, values: [1, 2, 3]},
    {place: "Hall, By Livingroom", id: 9, x: 420, y: 282, values: [1, 2, 3]},
    {place: "Sofa (Left Top)", id: 10, x: 474, y: 64, values: [1, 2, 3]},
    {place: "Sofa (Middle Top)", id: 11, x: 542, y: 62, values: [1, 2, 3]},
    {place: "Sofa (Right Top)", id: 12, x: 614, y: 66, values: [1, 2, 3]},
    {place: "Sofa (Right Middle)", id: 13, x: 614, y: 122, values: [1, 2, 3]},
    {place: "Sofa (Right Bottom)", id: 14, x: 614, y: 186, values: [1, 2, 3]},
    {place: "Computer", id: 15, x: 696, y: 76, values: [1, 2, 3]},
    {place: "Printer", id: 16, x: 764, y: 94, values: [1, 2, 3]},
    {place: "Cupboard (Left)", id: 17, x: 660, y: 316, values: [1, 2, 3]},
    {place: "Living room", id: 18, x: 542, y: 318, values: [1, 2, 3]},
    {place: "Cupboard (Right)", id: 19, x: 742, y: 346, values: [1, 2, 3]},
    {place: "Terrace, Computer Chair", id: 20, x: 846, y: 80, values: [1, 2, 3]},
    {place: "Terrace, Chair (Top)", id: 21, x: 874, y: 176, values: [1, 2, 3]},
    {place: "Terrace, play", id: 22, x: 944, y: 318, values: [1, 2, 3]},
    {place: "Bedroom, Cupboard", id: 23, x: 502, y: 398, values: [1, 2, 3]},
    {place: "Bedroom, Bed (Top Left)", id: 24, x: 650, y: 448, values: [1, 2, 3]},
    {place: "Bedroom, Bed (Bottom Left)", id: 25, x: 650, y: 502, values: [1, 2, 3]},
    {place: "Bedroom, Bed (Middle Right)", id: 26, x: 736, y: 474, values: [1, 2, 3]},
    {place: "Bedroom, Night Table", id: 27, x: 800, y: 400, values: [1, 2, 3]},
    {place: "Bedroom, Windowsill", id: 28, x: 816, y: 458, values: [1, 2, 3]},
    {place: "Bedroom, Closet", id: 30, x: 464, y: 520, values: [1, 2, 3]}
];

/* GET home page. */
router.get('/', function(req, res, next) {
    var newLocations = locations;
    async.forEachOf(locations, function(location, placeID, callback) {
        Fingerprint.findOne({"placeID": location.id}, function(err, element) {
            if (err) return callback(err);
            if(element != null) {
                var values = element.values;
                newLocations[placeID].values = values;
                console.log(location.id + " has values " + values);
                return callback();
            } else {
                newLocations[placeID].values = [0, 0, 0];
                console.log(location.id + " was unknown");
                return callback();
            }
        });
    }, function (err) {
        if (err) throw err;
        console.log("When is this printed?????");
        locations = newLocations;
        res.render('pages/fingerprint', {dots: { phones: phones, locations: locations }});
    });
});

/* POST home page. */
router.post('/', function(req, res, next) {
    console.log(JSON.stringify(req.headers));
    console.log(req.body);
    if(req.body.hasOwnProperty('values') && req.body.hasOwnProperty('phoneID') && req.body.hasOwnProperty('placeID') &&
       check(req.body.values).is("array") && check(req.body.phoneID).is("number") && check(req.body.placeID).is("number") ){

        postFingerprint(req, res);

    } else {
        res.status(400);
        res.send('POST request to the homepage not successful');
        console.log('POST was not successful!');
    }
});

function postFingerprint(req, res){
    Fingerprint.findOne({"placeID": req.body.placeID}, function(err, element) {
        if(err) throw err;
        var avg = d3.mean(req.body.values);

        // Element already exists
        if(element != null){
            var newVals = element.values;
            newVals[req.body.phoneID - 1] = avg;
            Fingerprint.findOneAndUpdate({"placeID": req.body.placeID},
                {"values": newVals},
                function (err, element) {
                    if (err) throw err;
                    res.status(200);
                    res.send('POST request to the homepage successful');
                    console.log('Update of fingerprint was successful!');
                });
        } else {
            var newVals = [0, 0, 0];
            newVals[req.body.phoneID - 1] = avg;
            var newFingerprint = Fingerprint({
                placeID: req.body.placeID,
                values: newVals,
                phoneID: req.body.phoneID
            });

            newFingerprint.save(function (err) {
                if (err) throw err;
                res.status(200);
                res.send('POST request to the homepage successful');
                console.log('Saving fingerprint was successful!');
            });
        }
    })
}

module.exports = router;