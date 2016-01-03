var express = require('express');
var d3 = require('d3');
var async = require('async');

var router = express.Router();
var check = require("check-type").init();

var Baseline = require('../models/baseline');
var constants = require('../util/Constants.js')

var phonesForBaseline = constants.phonesForBaseline;
/* GET home page. */
router.get('/', function(req, res, next) {
        res.render('pages/baseline',
            {
                numberOfBaselines: 2,
                phones: phonesForBaseline
            }
        );
});

/* POST home page. */
router.post('/', function(req, res, next) {
    if(req.body.hasOwnProperty('values') && req.body.hasOwnProperty('phoneID') && req.body.hasOwnProperty('placeID') && req.body.hasOwnProperty('run') &&
        check(req.body.values).is("array") && check(req.body.phoneID).is("number") && check(req.body.placeID).is("number") && check(req.body.run).is("number") ){

        postBaseline(req, res);

    } else {
        res.status(400);
        res.send('POST request to the homepage failed');
        console.log('POST failed!');
    }
});

function postBaseline(req, res){
    var index = req.body.phoneID - 1;
    Baseline.findOne({placeID: req.body.placeID, run: req.body.run}, function(err, element) {
        if(err) throw err;
        var avg = d3.mean(req.body.values);

        // Element already exists
        if(element != null){
            var newAvgs = element.averages;
            newAvgs[index] = avg;
            var newPhoneVals = element.phoneValues;
            newPhoneVals[index].values = req.body.values;
            Baseline.findOneAndUpdate({placeID: req.body.placeID, run: req.body.run},
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
                placeID: req.body.placeID,
                run: req.body.run,
                averages: newAvgs,
                phoneValues: phoneVals
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