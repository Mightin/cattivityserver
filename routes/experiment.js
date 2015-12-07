var express = require('express');

var router = express.Router();
var check = require("check-type").init();

var Experiment = require('../models/experiment');

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

    this.enqueue = function(item){
        queue.push(item);
    };

    this.dequeue = function(){
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

    // return the item at the specified position
    this.lookInto = function(queueOffset){
        if(offset + queueOffset < queue.length){
            return queue[offset + queueOffset]
        } else {
            return undefined
        }
    };
}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('pages/experiment', { title: 'About' });
});

/* POST home page. */
router.post('/', function(req, res, next) {
    if(req.body.hasOwnProperty('value') && req.body.hasOwnProperty('phoneID') && req.body.hasOwnProperty('time') &&
        check(req.body.value).is("number") && check(req.body.phoneID).is("number") ){  // should check date

        postExperiemnt(req, res);

        res.status(200);
        res.send('POST request to the homepage successful');
        console.log('POST was successful!');
    } else {
        res.status(400);
        res.send('POST request to the homepage not successful');
        console.log('POST was not successful!');
    }
});

function postExperiemnt(req, res){
    var values1 = new Queue();
    var item1 = {"id": 1, "value": -66};
    var item2 = {"id": 1, "value": -55};
    var item3 = {"id": 1, "value": -80};

    values1.enqueue(item1);
    values1.enqueue(item2);
    values1.enqueue(item3);

    var result1 = values1.dequeue();

    var result2 = values1.lookInto(0);
    console.log(result1.value);
    console.log(result2.value);
}

module.exports = router;
