var express = require('express');
var router = express.Router();
var check = require("check-type").init();

var Fingerprint = require('../models/fingerprint');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('pages/fingerprint', { title: 'About' });
});

/* POST home page. */
router.post('/', function(req, res, next) {
    if(req.body.hasOwnProperty('place') && req.body.hasOwnProperty('value') && req.body.hasOwnProperty('phoneID') &&
        check(req.body.place).is("string") && check(req.body.value).is("number") && check(req.body.phoneID).is("string")){

        var newFingerprint = Fingerprint({
            place: req.body.place,
            value: req.body.value,
            phoneID: req.body.phoneID
        });

        newFingerprint.save(function(err) {
            if (err) throw err;
            res.send('POST request to the homepage successful');
            console.log('Saving fingerprint was successful!');
        });

    } else {
        res.send('POST request to the homepage not successful');
        console.log('POST was not successful!');
    }
});
module.exports = router;