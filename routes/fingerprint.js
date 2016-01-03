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
                    numberOfFingerprints: numberOfFingerprints,
                    phones: phones
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
        dataPoint.averages = doc.averages;
        dataPoint.phonesValues = doc.phonesValues;
        dataPoint.run = doc.run;
        data.push(dataPoint);
    }).on('error', function (err) {
        console.log(err);
    }).on('close', function () {
        res.writeHeader(200, {"Content-Type": "application/json"});
        res.write(JSON.stringify(data));
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
        var avg = d3.mean(req.body.values);

        // Element already exists
        if(element != null){
            var newAvgs = element.averages;
            newAvgs[index] = avg;
            var newPhoneVals = element.phoneValues;
            newPhoneVals[index].values = req.body.values;
            Fingerprint.findOneAndUpdate({placeID: req.body.placeID, run: req.body.run},
                {
                    averages: newAvgs,
                    phoneValues: newPhoneVals
                },
                function (err, element) {
                    if (err) throw err;
                    res.status(200);
                    res.send('POST request to the homepage successful');
                    console.log('Update of fingerprint was successful!');
                }
            );

        } else {
            var newAvgs = [0,0,0];
            newAvgs[index] = avg;
            var phoneVals = [{values: [0]}, {values: [0]}, {values: [0]}];
            phoneVals[index].values = req.body.values;

            var newFingerprint = Fingerprint({
                placeID: req.body.placeID,
                run: req.body.run,
                averages: newAvgs,
                phoneValues: phoneVals
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