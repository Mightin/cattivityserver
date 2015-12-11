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

var phonesForTest = [
    {place: "Kitchen", id: 1, x: 560, y: 175},
    {place: "Livingroom", id: 2, x: 700, y: 80},
    {place: "Bedroom", id: 3, x: 560, y: 330}
];

var locations = [
    {place: "Food Bowl", placeID: 1, x: 64, y: 106},
    {place: "Kitchen Hood", placeID: 2, x: 208, y: 198},
    {place: "Kitchen Table", placeID: 3, x: 58, y: 286},
    {place: "Kitchen Shelves", placeID: 4, x: 66, y: 350},
    {place: "Kitchen Closet", placeID: 5, x: 218, y: 344},
    {place: "Bathroom Litterbox", placeID: 6, x: 328, y: 182},
    {place: "Bathroom Sink", placeID: 7, x: 420, y: 106},
    {place: "Hall, By Livingroom", placeID: 8, x: 420, y: 282},
    {place: "Hall Door", placeID: 9, x: 376, y: 342},
    {place: "Sofa (Left Top)", placeID: 10, x: 474, y: 64},
    {place: "Sofa (Middle Top)", placeID: 11, x: 542, y: 62},
    {place: "Sofa (Right Top)", placeID: 12, x: 614, y: 66},
    {place: "Sofa (Right Middle)", placeID: 13, x: 614, y: 122},
    {place: "Sofa (Right Bottom)", placeID: 14, x: 614, y: 186},
    {place: "Computer", placeID: 15, x: 696, y: 76},
    {place: "Printer", placeID: 16, x: 764, y: 94},
    {place: "Cupboard (Left)", placeID: 17, x: 660, y: 316},
    {place: "Living room", placeID: 18, x: 542, y: 318},
    {place: "Cupboard (Right)", placeID: 19, x: 742, y: 346},
    {place: "Terrace, Computer Chair", placeID: 20, x: 846, y: 80},
    {place: "Terrace, Chair (Top)", placeID: 21, x: 874, y: 176},
    {place: "Terrace, play", placeID: 22, x: 944, y: 318},
    {place: "Bedroom, Cupboard", placeID: 23, x: 502, y: 398},
    {place: "Bedroom, Bed (Top Left)", placeID: 24, x: 650, y: 448},
    {place: "Bedroom, Bed (Bottom Left)", placeID: 25, x: 650, y: 502},
    {place: "Bedroom, Bed (Middle Right)", placeID: 26, x: 736, y: 474},
    {place: "Bedroom, Night Table", placeID: 27, x: 800, y: 400},
    {place: "Bedroom, Windowsill", placeID: 28, x: 816, y: 458},
    {place: "Hall, By Shoes", placeID: 29, x: 292, y: 358},
    {place: "Bedroom, Closet", placeID: 30, x: 464, y: 520},

    {place: "0,0", placeID: 31, x: 574, y: 330},
    {place: "1,0", placeID: 31, x: 623, y: 330},
    {place: "2,0", placeID: 31, x: 673, y: 330},
    {place: "3,0", placeID: 31, x: 722, y: 330},

    {place: "0,1", placeID: 31, x: 574, y: 281},
    {place: "1,1", placeID: 31, x: 623, y: 281},
    {place: "2,1", placeID: 31, x: 673, y: 281},
    {place: "3,1", placeID: 31, x: 722, y: 281},

    {place: "0,2", placeID: 31, x: 574, y: 231},
    {place: "1,2", placeID: 31, x: 623, y: 231},
    {place: "2,2", placeID: 31, x: 673, y: 231},
    {place: "3,2", placeID: 31, x: 722, y: 231},

    {place: "0,3", placeID: 31, x: 574, y: 182},
    {place: "1,3", placeID: 31, x: 623, y: 182},
    {place: "2,3", placeID: 31, x: 673, y: 182},
    {place: "3,3", placeID: 31, x: 722, y: 182}
];

/* GET home page. */
router.get('/', function(req, res, next) {

    var data = [];
    var stream = Fingerprint.find({}).stream();
    stream.on('data', function (doc) {
        var index = doc.placeID - 1;
        var dataPoint = {};
        dataPoint.place = locations[index].place;
        dataPoint.placeID = locations[index].placeID;
        dataPoint.x = locations[index].x;
        dataPoint.y = locations[index].y;
        dataPoint.placeID = doc.placeID;
        dataPoint.values = doc.values;
        dataPoint.measuredValues = doc.measuredValues;
        dataPoint.run = doc.run;
        data.push(dataPoint);
    }).on('error', function (err) {
        console.log(err);
    }).on('close', function () {
        res.render('pages/fingerprint', {dots: { phones: phones, phonesForTest: phonesForTest, locations: data}});
    });
});

/* POST home page. */
router.post('/', function(req, res, next) {
    if(req.body.hasOwnProperty('values') && req.body.hasOwnProperty('phoneID') && req.body.hasOwnProperty('placeID') && req.body.hasOwnProperty('run') &&
       check(req.body.values).is("array") && check(req.body.phoneID).is("number") && check(req.body.placeID).is("number") && check(req.body.run).is("number") ){

        postFingerprint(req, res);

    } else {
        res.status(400);
        res.send('POST request to the homepage not successful');
        console.log('POST was not successful!');
    }
});

function postFingerprint(req, res){
    Fingerprint.findOne({placeID: req.body.placeID, run: req.body.run}, function(err, element) {
        if(err) throw err;
        var avg = d3.mean(req.body.values);

        // Element already exists
        if(element != null){
            var index = req.body.phoneID - 1;
            var newVals = element.values;
            newVals[index] = avg;
            var newMeasured = element.measuredValues;
            newMeasured[(index * 3) + 0] = req.body.values[0];
            newMeasured[(index * 3) + 1] = req.body.values[1];
            newMeasured[(index * 3) + 2] = req.body.values[2];
            newMeasured[(index * 3) + 3] = req.body.values[3];
            newMeasured[(index * 3) + 4] = req.body.values[4];
            newMeasured[(index * 3) + 5] = req.body.values[5];
            newMeasured[(index * 3) + 6] = req.body.values[6];
            Fingerprint.findOneAndUpdate({placeID: req.body.placeID, run: req.body.run},
                {values: newVals,
                 measuredValues: newMeasured},
                function (err, element) {
                    if (err) throw err;
                    res.status(200);
                    res.send('POST request to the homepage successful');
                    console.log('Update of fingerprint was successful!');
                }
            );

        } else {
            var index = req.body.phoneID - 1;
            var newVals = [0, 0, 0];
            newVals[index] = avg;
            var newMeasured = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            newMeasured[(index * 3) + 0] = req.body.values[0];
            newMeasured[(index * 3) + 1] = req.body.values[1];
            newMeasured[(index * 3) + 2] = req.body.values[2];
            newMeasured[(index * 3) + 3] = req.body.values[3];
            newMeasured[(index * 3) + 4] = req.body.values[4];
            newMeasured[(index * 3) + 5] = req.body.values[5];
            newMeasured[(index * 3) + 6] = req.body.values[6];
            var newFingerprint = Fingerprint({
                placeID: req.body.placeID,
                values: newVals,
                measuredValues: newMeasured,
                run: req.body.run
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