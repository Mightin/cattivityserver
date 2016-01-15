var express = require('express');
var d3 = require('d3');
var async = require('async');

var router = express.Router();
var check = require("check-type").init();

var Fingerprint = require('../models/fingerprint');
var constants = require('../util/Constants.js')

var phones = constants.phones;
var locations = constants.locations;

/* GET home page. */
router.get('/', function(req, res, next) {
    var numberOfFingerprints = 0;

    async.parallel([
            function(callback){
                Fingerprint.distinct('run').exec(function (err, runs) {
                    if(err){
                        return callback(err);
                    }
                    numberOfFingerprints = runs.length;
                    callback();
                });
            }
        ], function(err){
            if(err){throw err;}
            res.render('pages/fingerprint',
                {
                    numberOfFingerprints: numberOfFingerprints
                }
            );
        }
    );
});

/* GET fingerprint data. */
router.get('/:fingerprintnr', function(req, res, next) {
    var fingerprintnr = req.params.fingerprintnr;
    var data = [];
    var stream = Fingerprint.find({run: fingerprintnr}).stream();
    stream.on('data', function (doc) {
        var index = doc.placeID - 1;
        var dataPoint = {};
        dataPoint.place = locations[index].place;
        dataPoint.x = locations[index].x;
        dataPoint.y = locations[index].y;
        dataPoint.placeID = doc.placeID;
        dataPoint.run = doc.run;
        dataPoint.averages = doc.averages;
        dataPoint.medians = doc.medians;
        dataPoint.deviations = doc.deviations;
        dataPoint.phoneValues = [];
        dataPoint.phoneValues[0] = doc.phoneValues[0].values;
        dataPoint.phoneValues[1] = doc.phoneValues[1].values;
        dataPoint.phoneValues[2] = doc.phoneValues[2].values;
        data.push(dataPoint);
    }).on('error', function (err) {
        console.log(err);
    }).on('close', function () {
        res.writeHeader(200, {"Content-Type": "application/json"});
        res.write(JSON.stringify(
            {
                data: data,
                phones: phones
            })
        );
        res.end();
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
    var index = req.body.phoneID;
    Fingerprint.findOne({placeID: req.body.placeID, run: req.body.run}, function(err, element) {
        if(err) throw err;
        var average = d3.mean(req.body.values);
        var median = d3.median(req.body.values);
        var deviation = d3.deviation(req.body.values);

        var averages;
        var medians;
        var deviations;
        var phoneValues;

        // Element already exists
        if(element != null){
            averages = element.averages;
            averages[index] = average;
            medians = element.medians;
            medians[index] = median;
            deviations = element.deviations;
            deviations[index] = deviation;
            phoneValues = element.phoneValues;
            phoneValues[index].values = req.body.values;

            Fingerprint.findOneAndUpdate({placeID: req.body.placeID, run: req.body.run},
                {
                    averages: averages,
                    medians: medians,
                    deviations: deviations,
                    phoneValues: phoneValues
                },
                function (err, element) {
                    if (err) throw err;
                    res.status(200);
                    res.send('POST request to the homepage successful');
                    console.log('Update of fingerprint was successful!');
                }
            );

        } else {
            averages = [0,0,0];
            averages[index] = average;
            medians = [0,0,0];
            medians[index] = median;
            deviations = [0,0,0];
            deviations[index] = deviation;
            phoneValues = [{values: [0]}, {values: [0]}, {values: [0]}];
            phoneValues[index].values = req.body.values;

            var newFingerprint = Fingerprint({
                placeID: req.body.placeID,
                run: req.body.run,
                averages: averages,
                medians: medians,
                deviations: deviations,
                phoneValues: phoneValues
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