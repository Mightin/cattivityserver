/**
 * Created by Martin on 17-12-2015.
 */
var express = require('express');
var router = express.Router();

var Place = require('../models/place');
var constants = require('../util/Constants');

var locations = constants.locations;
var places;

/* GET home page. */
router.get('/:madeFromRun/:experimentnr', function(req, res, next) {
    var madeFromRun = req.params.madeFromRun;
    var run = req.params.experimentnr;
    places = [ ];
    var stream = Place.find({run: run, madeFromRun: madeFromRun}).stream();
    stream.on('data', function (doc) {
        var placeID =  doc.placeID;
        var dataPoint = {};
        dataPoint.placeID = placeID;
        dataPoint.time = Math.round(doc.time / 1000);
        dataPoint.values = doc.values;
        dataPoint.run = doc.run;
        dataPoint.madeFromRun = doc.madeFromRun;
        dataPoint.x = locations[placeID - 1].x;
        dataPoint.y = locations[placeID - 1].y;
        places.push(dataPoint);
    }).on('error', function (err) {
        console.log(err);
    }).on('close', function () {
        res.writeHeader(200, {"Content-Type": "application/json"});
        res.write(JSON.stringify(places));
        res.end();
    });
});

module.exports = router;
