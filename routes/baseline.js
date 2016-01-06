var express = require('express');
var d3 = require('d3');
var async = require('async');

var router = express.Router();
var check = require("check-type").init();

var Baseline = require('../models/baseline');
var constants = require('../util/Constants.js')

var phonesForBaseline = constants.phonesForBaseline;
var locations = constants.locationsForBaseline;

/* GET home page. */
router.get('/', function(req, res, next) {
    var numberOfBaselines = 0;
    var baselineRuns = [];

    async.parallel([
            function(callback){
                Baseline.distinct('run').exec(function (err, runs) {
                    if(err){
                        return callback(err);
                    }
                    numberOfBaselines = runs.length;
                    baselineRuns = runs;
                    callback();
                });
            }
        ], function(err){
            if(err){throw err;}
            res.render('pages/baseline',
                {
                    numberOfBaselines: numberOfBaselines,
                    baselineRuns: baselineRuns,
                    phones: phonesForBaseline
                }
            );
        }
    );
});

/* GET baseline data. */
router.get('/:baselinenr', function(req, res, next) {
    var baselinenr = req.params.baselinenr;
    var data = [];
    var stream = Baseline.find({run: baselinenr}).stream();
    stream.on('data', function (doc) {
        var dataPoint = {};
        dataPoint.place = "" + doc.x + "," + doc.y;
        dataPoint.averages = doc.averages;
        dataPoint.run = doc.run;
        dataPoint.x = doc.x;
        dataPoint.y = doc.y;
        dataPoint.phoneValues = [];
        dataPoint.phoneValues[0] = doc.phoneValues[0].values;
        dataPoint.phoneValues[1] = doc.phoneValues[1].values;
        dataPoint.phoneValues[2] = doc.phoneValues[2].values;
        dataPoint.medians = [];
        dataPoint.medians[0] = d3.median(doc.phoneValues[0].values);
        dataPoint.medians[1] = d3.median(doc.phoneValues[1].values);
        dataPoint.medians[2] = d3.median(doc.phoneValues[2].values);
        dataPoint.deviations = [];
        dataPoint.deviations[0] = d3.deviation(doc.phoneValues[0].values);
        dataPoint.deviations[1] = d3.deviation(doc.phoneValues[1].values);
        dataPoint.deviations[2] = d3.deviation(doc.phoneValues[2].values);
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
    if(req.body.hasOwnProperty('values') && req.body.hasOwnProperty('phoneID') && req.body.hasOwnProperty('run') && req.body.hasOwnProperty('x') && req.body.hasOwnProperty('y') &&
        check(req.body.values).is("array") && check(req.body.phoneID).is("number") && check(req.body.run).is("number") && check(req.body.x).is("number") && check(req.body.y).is("number") ){

        postBaseline(req, res);

    } else {
        res.status(400);
        res.send('POST request to the homepage failed');
        console.log('POST failed!');
    }
});

function postBaseline(req, res){
    var index = req.body.phoneID;
    Baseline.findOne({x: req.body.x, y: req.body.y, run: req.body.run}, function(err, element) {
        if(err) throw err;
        var avg = d3.mean(req.body.values);

        // Element already exists
        if(element != null){
            var newAvgs = element.averages;
            newAvgs[index] = avg;
            var newPhoneVals = element.phoneValues;
            newPhoneVals[index].values = req.body.values;
            Baseline.findOneAndUpdate({x: req.body.x, y: req.body.y, run: req.body.run},
                {
                    averages: newAvgs,
                    phoneValues: newPhoneVals
                },
                function (err, element) {
                    if (err) throw err;
                    res.status(200);
                    res.send('POST request to the homepage successful');
                    console.log('Update of baseline was successful!');
                }
            );

        } else {
            var newAvgs = [0,0,0];
            newAvgs[index] = avg;
            var phoneVals = [{values: [0]}, {values: [0]}, {values: [0]}];
            phoneVals[index].values = req.body.values;

            var newBaseline = Baseline({
                run: req.body.run,
                averages: newAvgs,
                phoneValues: phoneVals,
                x: req.body.x,
                y: req.body.y
            });

            newBaseline.save(function (err) {
                if (err) throw err;
                res.status(200);
                res.send('POST request to the homepage successful');
                console.log('Saving baseline was successful!');
            });
        }
    })
}

module.exports = router;