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
  
  var name = parts[0],
      page = parts[1] || 0,
      limit = req.headers['response-limit'] || config.api.per_page,
      offset = limit * page,
      outputs = [];
  
  if (page < 0) {
    db.each("SELECT timestamp, name, response FROM records WHERE `name`=? ORDER BY timestamp DESC", name, iterateFunction, completeFunction);
  } else {
    db.each("SELECT timestamp, name, response FROM records WHERE `name`=?  ORDER BY timestamp DESC LIMIT ? OFFSET ?", name, limit, offset, iterateFunction, completeFunction);
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
  var headers = {};
      headers["Content-Type"] = "application/json";
      headers["Access-Control-Allow-Origin"] = "*";
      headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
      headers["Access-Control-Allow-Credentials"] = true;
      headers["Access-Control-Max-Age"] = '86400'; // 24 hours
      headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept, response-limit";
  function completeFunction () {
    if (req.method === 'OPTIONS') {
    
      res.writeHead(200,headers);
      res.end();
    } else {
      
      res.writeHead(200,headers);
      res.write(JSON.stringify(outputs));
      res.end(); 
    }
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