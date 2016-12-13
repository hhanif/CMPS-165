//MultiLine Js w/ d3

//determines the size of the margins/ parameters of the graph via height/width.
var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
//instantiate x and y axis give height and width
var parseDate = d3.time.format("%Y").parse;
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

//instantiation of color variable for line use later
var color = d3.scale.category10();

//Orients the x axis to the bottom of the container and y axis to the left of the container
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

//Instantiates and defines a line object that will be utilized multiple times later.
//x axis depicts year and y axis depicts energy per capita
var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.epc); });

//creates the body container
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Brings in csv data file and parses info
d3.csv("EPC_2000_2010_new.csv", function(error, data) {
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "year"; }));
  data.forEach(function(d) { d.year = parseDate(d.year);});

//Instantiates cities given name and year
var cities = color.domain().map(function(name){
  return {
    name: name,
    values: data.map(function(d) { return {year: d.year, epc: +d[name]}; })
  };
});
//defines x values by the year data from the csv file
x.domain(d3.extent(data, function(d) { return d.year; }));
//defines y values by the cities data from the csv file and covers mins and max values to stay within scope.
y.domain([
  d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.epc; }); }),
  d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.epc; }); })
]);

//appends x axis to the container
svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis)
svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis)

//Appends the gridlines on both x and y axis
svg.append("g")
  .attr("class", "grid")
  .attr("transform", "translate(0," + height + ")")
  .call(make_x_gridlines()
    .tickSize(-height,0,0)
    .tickFormat(""))

svg.append("g")
  .attr("class", "grid")
  .call(make_y_gridlines()
    .tickSize(-width,0,0)
    .tickFormat(""))

//appends the text "year" to the end of the x axis
//withholds attributes controlling text in regards to this axis.
.append("text")
  .attr("transform", "rotate(0)")
  .attr("x", width +50)
  .attr("y", height+10)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Year");
//apppends the y axis to the container and the text "Million BTUs per Person"
//withholds attributes controlling text in regards to this axis.
svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -230)
  .attr("y", -40)
  .style("text-anchor", "middle")
  .text("Million BTUs Per Person");

function make_x_gridlines(){
    return d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(5)
}
function make_y_gridlines(){
    return d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5)
}
//Insantiates city variable to apply towards the city data that we'll obtain from csv
var city = svg.selectAll(".city")
  .data(cities)
  .enter().append("g")
  .attr("class", "city");

//Instantiates path of our stroke that will essentially be our line.
var path =  city.append("path")
  .attr("class", "line")
  .attr("d", function(d) { return line(d.values); })
  .style("stroke", function(d) { return color(d.name); });

//obtains total length of the path so we can put the data at the end of it before drawing.
var totalLength = path.node().getTotalLength();
//sets the path for the stroke to follow and how long it should go for.
path
  .attr("stroke-dasharray", totalLength + " " + totalLength)
  .attr("stroke-dashoffset", totalLength)
  .transition()
    .duration(0)
    .ease("linear")
    .attr("stroke-dashoffset", 0);
//appends the city text to the end of the path
city.append("text")
  .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
  .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.epc) + ")"; })
  .attr("x", 3)
  .attr("dy", ".35em")
  .text(function(d) { return d.name; });
});
