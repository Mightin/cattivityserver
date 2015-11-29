var express = require('express');
var d3 = require('d3');
var router = express.Router();
var check = require("check-type").init();

var Fingerprint = require('../models/fingerprint');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('pages/fingerprint', { title: 'About' });
});

/* POST home page. */
router.post('/', function(req, res, next) {
    if(req.body.hasOwnProperty('place') && req.body.hasOwnProperty('values') && req.body.hasOwnProperty('phoneID') &&
        check(req.body.place).is("string") && check(req.body.values).is("array") && check(req.body.phoneID).is("string")){

        var avg = d3.mean(req.body.values);

        var newFingerprint = Fingerprint({
            place: req.body.place,
            values: req.body.values,
            phoneID: req.body.phoneID,
            avg: avg
        });

        newFingerprint.save(function(err) {
            if (err) throw err;
            res.status(200);
            res.send('POST request to the homepage successful');
            console.log('Saving fingerprint was successful!');
        });

    } else {
        res.status(400);
        res.send('POST request to the homepage not successful');
        console.log('POST was not successful!');
    }
});
module.exports = router;