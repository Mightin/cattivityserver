var express = require('express');

var router = express.Router();
var check = require("check-type").init();
var d3 = require("d3");
var moment = require('moment');
moment().format();

var Experiment = require('../models/experiment');

var valuesFromPhones = [new Queue(), new Queue(), new Queue()];
var maxRange = 10000;

var locations = [
    {place: "Food Bowl", id: 1, x: 64, y: 106},
    {place: "Kitchen Hood", id: 2, x: 208, y: 198},
    {place: "Kitchen Table", id: 3, x: 58, y: 286},
    {place: "Kitchen Shelves", id: 4, x: 66, y: 350},
    {place: "Kitchen Closet", id: 5, x: 218, y: 344},
    {place: "Bathroom Litterbox", id: 6, x: 328, y: 182},
    {place: "Bathroom Sink", id: 7, x: 420, y: 106},
    {place: "Hall, By Shoes", id: 29, x: 292, y: 358},
    {place: "Hall Door", id: 8, x: 376, y: 342},
    {place: "Hall, By Livingroom", id: 9, x: 420, y: 282},
    {place: "Sofa (Left Top)", id: 10, x: 474, y: 64},
    {place: "Sofa (Middle Top)", id: 11, x: 542, y: 62},
    {place: "Sofa (Right Top)", id: 12, x: 614, y: 66},
    {place: "Sofa (Right Middle)", id: 13, x: 614, y: 122},
    {place: "Sofa (Right Bottom)", id: 14, x: 614, y: 186},
    {place: "Computer", id: 15, x: 696, y: 76},
    {place: "Printer", id: 16, x: 764, y: 94},
    {place: "Cupboard (Left)", id: 17, x: 660, y: 316},
    {place: "Living room", id: 18, x: 542, y: 318},
    {place: "Cupboard (Right)", id: 19, x: 742, y: 346},
    {place: "Terrace, Computer Chair", id: 20, x: 846, y: 80},
    {place: "Terrace, Chair (Top)", id: 21, x: 874, y: 176},
    {place: "Terrace, play", id: 22, x: 944, y: 318},
    {place: "Bedroom, Cupboard", id: 23, x: 502, y: 398},
    {place: "Bedroom, Bed (Top Left)", id: 24, x: 650, y: 448},
    {place: "Bedroom, Bed (Bottom Left)", id: 25, x: 650, y: 502},
    {place: "Bedroom, Bed (Middle Right)", id: 26, x: 736, y: 474},
    {place: "Bedroom, Night Table", id: 27, x: 800, y: 400},
    {place: "Bedroom, Windowsill", id: 28, x: 816, y: 458},
    {place: "Bedroom, Closet", id: 30, x: 464, y: 520}
];

var places = [
    {id: 1, time: 1449535307},
    {id: 2, time: 1449535308},
    {id: 3, time: 1449535309},
    {id: 4, time: 1449535310},
    {id: 5, time: 1449535311},
    {id: 6, time: 1449535312},
    {id: 7, time: 1449535313}
]

// FIFO queue with extra spices
function Queue(){
    var queue  = [];
    var maxOffset = 10;
    var offset = 0;

    this.getLength = function(){
        return (queue.length - offset);
    };

    this.isEmpty = function(){
        return (this.getLength() == 0);
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
    res.render('pages/experiment', {dots: {locations: locations, places: places}});
});

/* POST home page. */
router.post('/', function(req, res, next) {
    if(req.body.hasOwnProperty('value') && req.body.hasOwnProperty('phoneID') && req.body.hasOwnProperty('time') &&
        check(req.body.value).is("number") && check(req.body.phoneID).is("number") && check(req.body.phoneID).is("number")){  // date is millis since unix

        // get item
        var item = req.body;

        // store the item, at the correct phone
        valuesFromPhones[req.body.phoneID - 1].enqueue(item);

        // if there isn't enough data
        if(valuesFromPhones[0].isEmpty() || valuesFromPhones[1].isEmpty() || valuesFromPhones[2].isEmpty()){
            res.status(200);
            res.send('POST request to the homepage successful');
            console.log('POST was successful, no point made!');
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
            if(diff <= maxRange){
                var values = [data1.value, data2.value, data3.value];
                var time = d3.mean(data1.time, data2.time, data3.time);

                var newExperiment = Experiment({
                    "values": values,
                    "time": time
                });
                newExperiment.save(function(err){
                    if(err) throw err;
                    res.status(200);
                    res.send('POST request to the homepage successful');
                    console.log('Saving experiment was successful! Datapoint: ' + newExperiment);
                });
            }

            // remove the temporally smallest element from the queues
            // if multiple first elements are smallest, remove all
            if(min == data1.time){
                valuesFromPhones[0].dequeue();
            } else if(min == data2.time){
                valuesFromPhones[1].dequeue();
            } else {
                valuesFromPhones[2].dequeue();
            }
        }
    } else {
        res.status(400);
        res.send('POST request to the homepage failed');
        console.log('POST failed!');
    }
});

module.exports = router;
