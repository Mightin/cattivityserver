var express = require('express');
var d3 = require('d3');
var async = require('async');

var router = express.Router();
var check = require("check-type").init();

var Fingerprint = require('../models/fingerprint');
var constants = require('../util/constants.js')

var phones = constants.phones;
var phonesForBaseline = constants.phonesForBaseline;
var locations = constants.locations;

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
        res.render('pages/fingerprint', {dots: { phones: phones, phonesForBaseline: phonesForBaseline, locations: data}});
    });
});

/* POST home page. */
router.post('/', function(req, res, next) {
    if(req.body.hasOwnProperty('values') && req.body.hasOwnProperty('phoneID') && req.body.hasOwnProperty('placeID') && req.body.hasOwnProperty('run') &&
       check(req.body.values).is("array") && check(req.body.phoneID).is("number") && check(req.body.placeID).is("number") && check(req.body.run).is("number") ){

        postFingerprint(req, res);

    } else {
        res.status(400);
        res.send('POST request to the homepage failed');
        console.log('POST failed!');
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