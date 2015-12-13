var express = require('express');
var router = express.Router();

var check = require("check-type").init();
var d3 = require("d3");
var moment = require('moment');
moment().format();

var Fingerprint = require('../models/fingerprint');
var Experiment = require('../models/experiment');
var Place = require('../models/place');
var constants = require('../util/Constants');
var Queue = require('../util/queue');

var valuesFromPhones = [new Queue(), new Queue(), new Queue()];
var maxDifference = 10000;

var locations = constants.locations;

var places = [
    {placeID: 1, x: 64, y: 106, time: 1449973508, run: 0},
    {placeID: 2, x: 208, y: 198, time: 1449973509, run: 0},
    {placeID: 3, x: 58, y: 286, time: 1449973510, run: 0},
    {placeID: 4, x: 66, y: 350, time: 1449973511, run: 0},
    {placeID: 5, x: 218, y: 344, time: 1449973512, run: 0},
    {placeID: 6, x: 328, y: 182, time: 1449973513, run: 0}
];

var fingerPrintsAcquired = false;
var fingerprints = [[]];

/* GET home page. */
router.get('/', function(req, res, next) {
    var stream = Place.find({}).stream();
    stream.on('data', function (doc) {
        var placeID =  doc.placeID;
        var dataPoint = {};
        dataPoint.placeID = placeID;
        dataPoint.time = doc.time;
        dataPoint.values = doc.values;
        dataPoint.run = doc.run;
        dataPoint.x = locations[placeID - 1].x;
        dataPoint.y = locations[placeID - 1].y;
        places.push(dataPoint);
    }).on('error', function (err) {
        console.log(err);
    }).on('close', function () {
        console.log(places[0]);
        console.log(places[1]);
        console.log(places[2]);
        res.render('pages/experiment', {dots: {places: places}});
    });

});

/* POST home page. */
router.post('/', function(req, res, next) {
    if(req.body.hasOwnProperty('value') && req.body.hasOwnProperty('phoneID') && req.body.hasOwnProperty('time') && req.body.hasOwnProperty('run') &&
        check(req.body.value).is("number") && check(req.body.phoneID).is("number") && check(req.body.time).is("number") && check(req.body.run).is("number")){  // date is millis since unix
        // get item
        var item = req.body;

        if(!fingerPrintsAcquired){
            getFingerprints();
        }

        // save the data
        saveExperiment(item);

        // store the item, at the correct phone
        valuesFromPhones[item.phoneID - 1].enqueue(item);

        // if there isn't enough data
        if(valuesFromPhones[0].isEmpty() || valuesFromPhones[1].isEmpty() || valuesFromPhones[2].isEmpty()){
            res.status(200);
            res.send('POST request to the homepage successful');
            console.log('POST was successful, no place point made!');
        } else { // there is data from each phone

            // get the first element from each phones queue
            var data1 = valuesFromPhones[0].lookInto(0);
            var data2 = valuesFromPhones[1].lookInto(0);
            var data3 = valuesFromPhones[2].lookInto(0);

            // find min and max times
            var minTime = d3.min([data1.time, data2.time, data3.time]);
            var maxTime = d3.max([data1.time, data2.time, data3.time]);

            // find difference
            var diff = maxTime - minTime;

            // Point temporally within range
            if(diff <= maxDifference){
                var dataValues = [data1.value, data2.value, data3.value];
                var avgTime = d3.mean([data1.time, data2.time, data3.time]);
                console.log("AvgTime: " + avgTime);
                console.log("fingerprints.length: " + fingerprints.length);
                var bestPlaceID;
                var bestDistance;
                var distance;
                for(var i = 0; i < fingerprints.length; i++){
                    bestPlaceID = 0;
                    bestDistance = 9999999999;
                    console.log("i" + i);
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

                    console.log("before making new place");
                    // save the place
                    var newPlace = new Place({
                        placeID: bestPlaceID,
                        time: avgTime,
                        values: dataValues,
                        run: data1.run,
                        madeFromRun: (i+1)
                    });
                    console.log("before saving new place");
                    newPlace.save(function (err) {
                        if (err){
                            console.log(err);
                            throw err;
                        }
                        console.log('New place have been calculated. Place: ' + bestPlaceID + " made from run: " + data1.run);
                    });
                    console.log("after saving new place");
                }
                console.log("Done with both for-loops");
            }

            // remove the temporally smallest element from the queues
            // if multiple first elements are smallest, remove all
            console.log("minTime: " + minTime + " data1: " + data1.time);
            if(min == data1.time){
                valuesFromPhones[0].dequeue();
            } else if(min == data2.time){
                valuesFromPhones[1].dequeue();
            } else if(min == data3.time){
                valuesFromPhones[2].dequeue();
            }
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
