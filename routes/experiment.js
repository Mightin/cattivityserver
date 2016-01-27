var async = require('async');
var express = require('express');
var router = express.Router();

var check = require("check-type").init();
var d3 = require("d3");

var Fingerprint = require('../models/fingerprint');
var Experiment = require('../models/experiment');
var Place = require('../models/place');

var Queue = require('../util/queue');

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

var valuesFromPhones = [new Queue(), new Queue(), new Queue()];
var maxDifference = 10000;
var fingerPrintsAcquired = false;
var fingerprints = [[]];
var lastPlaceID = [99, 99, 99, 99, 99];
var lastI = [0, 0, 0, 0, 0];
var lastJ = [0, 0, 0, 0, 0];
var lastRun = 0;
var firstRun = true;

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
        if(item.run != lastRun){
            lastRun = item.run;
            valuesFromPhones = [new Queue(), new Queue(), new Queue()];
            lastPlaceID = [99, 99, 99, 99, 99];
            lastI = [0, 0, 0, 0, 0];
            lastJ = [0, 0, 0, 0, 0];
            firstRun = true;
        }

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
            var dataValues = [data1.value, data2.value, data3.value];
            var minTime = d3.min([data1.time, data2.time, data3.time]);
            var maxTime = d3.max([data1.time, data2.time, data3.time]);
            var avgTime = d3.mean([data1.time, data2.time, data3.time]);

            var bestPlaceID_1;
            var bestDistance_1;
            var distance_1;

            // Algorithm 1
            for(var i = 0; i < fingerprints.length; i++){
                bestPlaceID_1 = 0;
                bestDistance_1 = 9999999999;
                for(var j = 0; j < fingerprints[i].length; j++){
                    // find distance
                    distance_1 = Math.sqrt(
                        Math.pow((dataValues[0] - fingerprints[i][j].averages[0]), 2) +
                        Math.pow((dataValues[1] - fingerprints[i][j].averages[1]), 2) +
                        Math.pow((dataValues[2] - fingerprints[i][j].averages[2]), 2)
                    );
                    if(distance_1 < bestDistance_1){
                        bestDistance_1 = distance_1;
                        bestPlaceID_1 = fingerprints[i][j].placeID;
                    }
                }
                savePlace(bestPlaceID_1, avgTime, dataValues, data1.run, (i+1), 1);
            }

            // Algorithm 2 - Points temporally within range
            var diff = maxTime - minTime;
            var bestPlaceID_2;
            var bestDistance_2;
            var distance_2;
            if(diff <= maxDifference){
                for(var i = 0; i < fingerprints.length; i++){
                    bestPlaceID_2 = 0;
                    bestDistance_2 = 9999999999;
                    for(var j = 0; j < fingerprints[i].length; j++){
                        // find distance
                        distance_2 = Math.sqrt(
                            Math.pow((dataValues[0] - fingerprints[i][j].averages[0]), 2) +
                            Math.pow((dataValues[1] - fingerprints[i][j].averages[1]), 2) +
                            Math.pow((dataValues[2] - fingerprints[i][j].averages[2]), 2)
                        );
                        if(distance_2 < bestDistance_2){
                            bestDistance_2 = distance_2;
                            bestPlaceID_2 = fingerprints[i][j].placeID;
                        }
                    }
                    savePlace(bestPlaceID_2, avgTime, dataValues, data1.run, (i+1), 2);
                }
            }

            // Algorithm 3
            var bestPlaceID_3;
            var bestDistance_3;
            var distance_3;
            for(var i = 0; i < fingerprints.length; i++){
                bestPlaceID_3 = 0;
                bestDistance_3 = 9999999999;
                for(var j = 0; j < fingerprints[i].length; j++){
                    // find distance
                    distance_3 = Math.sqrt(
                        Math.pow((dataValues[0] - fingerprints[i][j].averages[0]), 2) +
                        Math.pow((dataValues[1] - fingerprints[i][j].averages[1]), 2) +
                        Math.pow((dataValues[2] - fingerprints[i][j].averages[2]), 2)
                    );
                    if(distance_3 < bestDistance_3){
                        bestDistance_3 = distance_3;
                        bestPlaceID_3 = fingerprints[i][j].placeID;
                        lastI[i] = i;
                        lastJ[i] = j;
                    }
                }
                if(firstRun == true){
                    lastPlaceID[i] = bestPlaceID_3;
                    firstRun = false;
                }
                if(bestPlaceID_3 != lastPlaceID){
                    if(dataValues[0] - fingerprints[lastI[i]][lastJ[i]].averages[0] < fingerprints[lastI[i]][lastJ[i]].deviations[0] &&
                       dataValues[1] - fingerprints[lastI[i]][lastJ[i]].averages[1] < fingerprints[lastI[i]][lastJ[i]].deviations[1] &&
                       dataValues[1] - fingerprints[lastI[i]][lastJ[i]].averages[1] < fingerprints[lastI[i]][lastJ[i]].deviations[1] ){
                        bestPlaceID_3 = lastPlaceID[i];
                    } else {
                        lastPlaceID[i] = bestPlaceID_3;
                    }
                }
                savePlace(bestPlaceID_3, avgTime, dataValues, data1.run, (i+1), 3);
            }

            // remove the temporally smallest element from the queues
            // if multiple first elements are smallest, remove all
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
        console.log('New place have been calculated. Place: ' + placeID + " made from run: " + fingerprintNr + " and algorithm: " + algorithm);
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
        dataPoint.run = doc.run;
        dataPoint.averages = doc.averages;
        dataPoint.medians = doc.medians;
        dataPoint.deviations = doc.deviations;
        dataPoint.phoneValues = doc.phoneValues;
        fingerprints[doc.run - 1].push(dataPoint);
    }).on('error', function (err) {
        console.log(err);
    }).on('close', function () {
        fingerPrintsAcquired = true;
        console.log("Got the fingerprints!");
    });
}

module.exports = router;
