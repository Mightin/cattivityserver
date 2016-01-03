var async = require('async');
var express = require('express');
var router = express.Router();

var check = require("check-type").init();
var d3 = require("d3");

var Fingerprint = require('../models/fingerprint');
var Experiment = require('../models/experiment');
var Place = require('../models/place');

var Queue = require('../util/queue');

var valuesFromPhones = [new Queue(), new Queue(), new Queue()];
var maxDifference = 10000;
var fingerPrintsAcquired = false;
var fingerprints = [[]];

/* GET home page. */
router.get('/', function(req, res, next) {
    var fingerprints = 0;
    var experiments = 0;

    async.parallel([
            function(callback){
                Fingerprint.distinct('run').exec(function (err, runs) {
                    if(err){
                        return callback(err);
                    }
                    fingerprints = runs.length;
                    callback();
                });
            },
            function(callback) {
                Experiment.distinct('run').exec(function (err, runs) {
                    if (err) {
                        return callback(err);
                    }
                    experiments = runs.length;
                    callback();
                });
            }
        ], function(err){
            if(err){throw err;}
            res.render('pages/experiment', {counts : {
                fingerprints: fingerprints,
                experiments: experiments
            }});
        }
    );
});

/* POST home page. */
router.post('/', function(req, res, next) {
    if(req.body.hasOwnProperty('value') && req.body.hasOwnProperty('phoneID') && req.body.hasOwnProperty('time') && req.body.hasOwnProperty('run') &&
        check(req.body.value).is("number") && check(req.body.phoneID).is("number") && check(req.body.time).is("number") && check(req.body.run).is("number")){  // date is millis since unix
        // get item
        var item = req.body;
        item.time = (new Date).getTime();
        if(!fingerPrintsAcquired){
            getFingerprints();
        }
        // save the data
        saveExperiment(item);
        var index = item.phoneID;
        // store the item, at the correct phone
        valuesFromPhones[index].enqueue(item);
        // if there isn't enough data
        if(valuesFromPhones[0].isEmpty() || valuesFromPhones[1].isEmpty() || valuesFromPhones[2].isEmpty()){
            res.status(200);
            res.send('POST request to the homepage successful');

        } else { // there is data from each phone
            // get the first element from each phones queue
            var data1 = valuesFromPhones[0].lookInto(0);
            var data2 = valuesFromPhones[1].lookInto(0);
            var data3 = valuesFromPhones[2].lookInto(0);

            // find min and max times
            var minTime = d3.min([data1.time, data2.time, data3.time]);
            var maxTime = d3.max([data1.time, data2.time, data3.time]);
            var avgTime = d3.mean([data1.time, data2.time, data3.time]);
            var dataValues = [data1.value, data2.value, data3.value];

            // find difference
            var diff = maxTime - minTime;

            // Point temporally within range

            var bestPlaceID;
            var bestDistance;
            var distance;

            // Algorithm 1
            for(var i = 0; i < fingerprints.length; i++){
                bestPlaceID = 0;
                bestDistance = 9999999999;
                for(var j = 0; j < fingerprints[i].length; j++){
                    // find distance
                    distance = Math.sqrt(
                        Math.pow((dataValues[0] - fingerprints[i][j].values[0]), 2) +
                        Math.pow((dataValues[1] - fingerprints[i][j].values[1]), 2) +
                        Math.pow((dataValues[2] - fingerprints[i][j].values[2]), 2)
                    );
                    if(distance < bestDistance){
                        bestDistance = distance;
                        bestPlaceID = fingerprints[i][j].placeID;
                    }
                }
                savePlace(bestPlaceID, avgTime, dataValues, data1.run, (i+1), 1);
            }

            // Points temporally within range
            // Algorithm 2
            if(diff <= maxDifference){
                var bestPlaceID;
                var bestDistance;
                var distance;
                for(var i = 0; i < fingerprints.length; i++){
                    bestPlaceID = 0;
                    bestDistance = 9999999999;
                    for(var j = 0; j < fingerprints[i].length; j++){
                        // find distance
                        distance = Math.sqrt(
                            Math.pow((dataValues[0] - fingerprints[i][j].values[0]), 2) +
                            Math.pow((dataValues[1] - fingerprints[i][j].values[1]), 2) +
                            Math.pow((dataValues[2] - fingerprints[i][j].values[2]), 2)
                        );
                        if(distance < bestDistance){
                            bestDistance = distance;
                            bestPlaceID = fingerprints[i][j].placeID;
                        }
                    }
                    savePlace(bestPlaceID, avgTime, dataValues, data1.run, (i+1), 2);
                }
            }

            // Algorithm 3
            for(var i = 0; i < fingerprints.length; i++){
                bestPlaceID = 0;
                bestDistance = 9999999999;
                for(var j = 0; j < fingerprints[i].length; j++){
                    // find distance
                    distance = Math.sqrt(
                        Math.pow((dataValues[0] - fingerprints[i][j].values[0]), 2) +
                        Math.pow((dataValues[1] - fingerprints[i][j].values[1]), 2) +
                        Math.pow((dataValues[2] - fingerprints[i][j].values[2]), 2)
                    );
                    if(distance < bestDistance){
                        bestDistance = distance;
                        bestPlaceID = fingerprints[i][j].placeID;
                    }
                }
                savePlace(bestPlaceID, avgTime, dataValues, data1.run, (i+1), 3);
            }
            // remove the temporally smallest element from the queues
            // if multiple first elements are smallest, remove all
            console.log("minTime: " + minTime + " data1: " + data1.time);
            if(minTime == data1.time){
                var del1 = valuesFromPhones[0].dequeue();
            } else if(minTime == data2.time){
                var del2 = valuesFromPhones[1].dequeue();
            } else if(minTime == data3.time){
                var del3 = valuesFromPhones[2].dequeue();
            }
            res.status(200);
            res.send('POST request to the homepage successful');
            console.log('POST was successful, places were made!');
        }
    } else {
        res.status(400);
        res.send('POST request to the homepage failed');
        console.log('POST failed!');
    }
});

function saveExperiment(item){
    var newExperiment = new Experiment({
        value: item.value,
        phoneID: item.phoneID,
        time: item.time,
        run: item.run
    });
    newExperiment.save(function (err) {
        if (err) throw err;
        console.log('Saving experiment was successful!');
    });
}

function savePlace(placeID, time, dataValues, run, fingerprintNr, algorithm){
    var placeAsJSON = {
        placeID: placeID,
        time: time,
        values: dataValues,
        run: run,
        madeFromRun: fingerprintNr,
        algorithm: algorithm
    };

    var newPlace = new Place(placeAsJSON);

    newPlace.save(function (err) {
        if (err){
            console.log(err);
            throw err;
        }
        console.log('New place have been calculated. Place: ' + placeID + " made from run: " + run + " and algorithm: " + algorithm);
    });
}

function getFingerprints(){
    var stream = Fingerprint.find({}).stream();
    stream.on('data', function (doc) {
        if(fingerprints[doc.run - 1] == undefined){
            fingerprints.push([]);
        }
        var dataPoint = {};
        dataPoint.placeID = doc.placeID;
        dataPoint.values = doc.values;
        dataPoint.measuredValues = doc.measuredValues;
        dataPoint.run = doc.run;
        fingerprints[doc.run - 1].push(dataPoint);
    }).on('error', function (err) {
        console.log(err);
    }).on('close', function () {
        fingerPrintsAcquired = true;
        console.log("Got the fingerprints!");
    });
}

module.exports = router;
