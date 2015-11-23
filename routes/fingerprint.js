var express = require('express');
var router = express.Router();

var Fingerprint = require('../models/fingerprint');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('pages/fingerprint', { title: 'About' });
});

/* POST home page. */
router.post('/', function(req, res, next) {
    console.log('Request  successfully!');

    var fingerprint = new Fingerprint({
        place: req.body.place,
        value: req.body.value,
        phoneID: req.body.phoneID
    });
    console.log('fingerprint var made successfully!');

    fingerprint.save(function(err) {
        if (err) throw err;
        console.log('User saved successfully!');
        res.send('POST request to the homepage');
        console.log('Res send successfully!');
    });
});
module.exports = router;
