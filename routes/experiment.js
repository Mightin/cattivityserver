var express = require('express');

var router = express.Router();
var check = require("check-type").init();

var Experiment = require('../models/experiment');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('pages/experiment', { title: 'About' });
});

/* POST home page. */
router.post('/', function(req, res, next) {
    if(req.body.hasOwnProperty('value') && req.body.hasOwnProperty('phoneID') && req.body.hasOwnProperty('time') &&
        check(req.body.value).is("number") && check(req.body.phoneID).is("number") ){  // should check date

        postExperiemnt(req, res);

    } else {
        res.status(400);
        res.send('POST request to the homepage not successful');
        console.log('POST was not successful!');
    }
});

function postExperiemnt(req, res){
    Experiment.findOne({"placeID": req.body.placeID}, function(err, element) {
        if(err) throw err;
        var avg = d3.mean(req.body.values);

        // Element already exists
        if(element != null){
            var newVals = element.values;
            newVals[req.body.phoneID - 1] = avg;
            Fingerprint.findOneAndUpdate({"placeID": req.body.placeID},
                {"values": newVals},
                function (err, element) {
                    if (err) throw err;
                    res.status(200);
                    res.send('POST request to the homepage successful');
                    console.log('Update of fingerprint was successful!');
                });
        } else {
            var newVals = [0, 0, 0];
            newVals[req.body.phoneID - 1] = avg;
            var newFingerprint = Fingerprint({
                placeID: req.body.placeID,
                values: newVals,
                phoneID: req.body.phoneID
            });

            newFingerprint.save(function (err) {
                if (err) throw err;
                res.status(200);
                res.send('POST request to the homepage successful');
                console.log('Saving fingerprint was successful!');
            });
        }
    })
}

// FIFO queue with extra spices
function Queue(){
    var queue  = [];
    var maxOffset = 10;
    var offset = 0;

    this.getLength = function(){
        return (queue.length - offset);
    };

    this.isEmpty = function(){
        return (queue.length == 0);
    };

    this.push = function(item){
        queue.push(item);
    };

    this.pop = function(){
        if (queue.length == 0) return undefined;

        var item = queue[offset];
        offset++;

        // Make queue shorter
        if(offset >= maxOffset){
            queue = queue.slice(offset);
            offset = 0;
        }

        return item;
    };

    /* Returns the item at the front of the queue (without dequeuing it). If the
     * queue is empty then undefined is returned.
     */
    this.lookInto = function(queueOffset){
        if(queue[offset + queueOffset] < queue.length){
            return queue[offset + queueOffset]
        } else {
            return undefined
        }
    };

    this.findEarliestElementWithinRange = function(range){

    };
}

module.exports = router;
