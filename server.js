var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    URL = require('url'),
    sqlite = require('sqlite3'),
    config = require('./config.json');

var db = new sqlite.Database(config.database.name);
'strict mode';

var endpoints = config.records.map((rec) => rec.name);

var server = http.createServer((req, res) => {
  var url = URL.parse(req.url),
      parts = url.pathname.split('/');
  
  if (parts[0] === "") {
    parts.shift();
  }
  
  if(typeof(config.api.per_page) === "undefined"){
    console.warn("Config not set up: No api.per_page\nDefaulting to 25");
    config.api.per_page = 25;
  }
  
  var name = parts[0];
  var page = parts[1] || 0;
  var offset = config.api.per_page * page;
  var outputs = [];
  
  if (page < 0) {
    db.each("SELECT timestamp, name, response FROM records WHERE `name`=?", name, iterateFunction, completeFunction);
  } else {
    db.each("SELECT timestamp, name, response FROM records WHERE `name`=? LIMIT ? OFFSET ?", name, config.api.per_page, offset, iterateFunction, completeFunction);
  }
  
  function iterateFunction (err,row) {
    if (err) {
      error(500,res);
    } else {
      outputs.push({
        timestamp:row.timestamp,
        data:JSON.parse(row.response)
      });
    }
  }
  
  function completeFunction () {
    res.writeHead(200,{"Content-Type": "application/json"});
    res.write(JSON.stringify(outputs));
    res.end();  
  }
});

server.listen((config.api.port || 8080), ()=>{
  console.log("Listening [",config.api.port,"]");
});

function error(code, res) {
  res.writeHead(code, {"Content-Type": "text/plain"});
  res.write(code+": ");
  if(code > 399 && code < 500){
    res.write("Client Error\n");
  } else if(code > 499 && code < 600) {
    res.write("Server error\n");
  }
  res.end();
}