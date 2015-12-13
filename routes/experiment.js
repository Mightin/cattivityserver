var express = require('express');
var router = express.Router();

var check = require("check-type").init();
var d3 = require("d3");
var moment = require('moment');
moment().format();

var Experiment = require('../models/experiment');
var Place = require('../models/place');
var constants = require('../util/constants');
var Queue = require('../util/queue');

var valuesFromPhones = [new Queue(), new Queue(), new Queue()];
var maxRange = 10000;

var locations = constants.locations;

var places = [
    {place: "Food Bowl", placeID: 1, x: 64, y: 106, time: 1449973508},
    {place: "Kitchen Hood", placeID: 2, x: 208, y: 198, time: 1449973509},
    {place: "Kitchen Table", placeID: 3, x: 58, y: 286, time: 1449973510},
    {place: "Kitchen Shelves", placeID: 4, x: 66, y: 350, time: 1449973511},
    {place: "Kitchen Closet", placeID: 5, x: 218, y: 344, time: 1449973512},
    {place: "Bathroom Litterbox", placeID: 6, x: 328, y: 182, time: 1449973513},
    {place: "Bathroom Sink", placeID: 7, x: 420, y: 106, time: 1449973514}
];



/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('pages/experiment', {dots: {locations: locations, places: places}});
});

/* POST home page. */
router.post('/', function(req, res, next) {
    if(req.body.hasOwnProperty('value') && req.body.hasOwnProperty('phoneID') && req.body.hasOwnProperty('time') && req.body.hasOwnProperty('run') &&
        check(req.body.value).is("number") && check(req.body.phoneID).is("number") && check(req.body.time).is("number") && check(req.body.run).is("number")){  // date is millis since unix
        // get item
        var item = req.body;

        // save the data
        saveExperiment(item);

        // store the item, at the correct phone
        valuesFromPhones[item.phoneID - 1].enqueue(item);

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

function saveExperiment(item){
    var newExperiment = new Experiment({
        value: item.value,
        phoneID: item.phoneID,
        time: item.time,
        run: item.run
    });

    newExperiment.save(function (err) {
        if (err) throw err;
        console.log('Saving experiment was successful!');
    });



}

module.exports = router;
