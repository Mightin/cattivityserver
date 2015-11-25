var express = require('express');
var router = express.Router();

var Fingerprint = require('../models/fingerprint');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('pages/fingerprint', { title: 'About' });
});

/* POST home page. */
router.post('/', function(req, res, next) {
    if(req.body.hasOwnProperty('place') && req.body.hasOwnProperty('value') && req.body.hasOwnProperty('phoneID') ){
        console.log(typeof req.body.place + typeof req.body.value + typeof req.body.phoneID);
        var fingerprint = new Fingerprint({
            place: req.body.place,
            value: req.body.value,
            phoneID: req.body.phoneID
        });
        fingerprint.save(function(err) {
            if (err) throw err;
            res.send('POST request to the homepage successful');
        });
        console.log('POST was successful!');
    } else {
        res.send('POST request to the homepage not successful');
        console.log('POST was not successful!');
    }
});
module.exports = router;