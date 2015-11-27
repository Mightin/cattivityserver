var phones = [
    {"place": "kitchen", "id": "D06450", "x": 250, "y": 200},
    {"place": "livingroom", "id": "D06460", "x": 600, "y": 300},
    {"place": "bedroom", "id": "D06470", "x": 450, "y": 500}
]

var locations = [
    {"place": "stue", "x": 500, "y": 100},
    {"place": "bad", "x": 300, "y": 400},
    {"place": "kitchen", "x": 200, "y": 200}
];

function placeDots(){
    var svgContainer = d3.select(".floorplan-svg");

    // place phones as red rectangles
    svgContainer.selectAll()
        .data(phones).enter()
        .append("rect")
        .attr("fill", "red")
        .attr("width", 10)
        .attr("height", 10)
        .attr("x", function(e) { return e.x })
        .attr("y", function(e) { return e.y });
    $('svg rect').tipsy({
        gravity: 'w',
        html: true,
        title: function() {
            var e = this.__data__;
            var tip = "Location: " + e.place + " and ID: " + e.id;
            return tip;
        }
    });

    // place locations as blue circles
    svgContainer.selectAll()
        .data(locations).enter()
        .append("circle")
        .attr("fill", "blue")
        .attr("r", 10)
        .attr("cx", function(d) { return d.x })
        .attr("cy", function(d) { return d.y })
        .classed("locations",true);
    $('svg circle').tipsy({
        gravity: 'w',
        html: true,
        title: function() {
            var d = this.__data__;
            var tip = "Location: " + d.place;
            return tip;
        }
    });
}