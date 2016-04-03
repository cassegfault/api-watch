var http = require('http'),
    timeQueue = require('timequeue'),
    sqlite = require('sqlite3'),
    URL = require('url'),
    config = require('./config.json');
var db = new sqlite.Database(config.database.name);

function setup(){
  // Run all DB setup here
  db.run("CREATE TABLE IF NOT EXISTS records (`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `name`	TEXT, `timestamp`	INT,`response`	BLOB)");
  // create queues for workers
  config.records.forEach(function(record){
    var q = new timeQueue(createWorker(record.name,record.url),{ 
      concurrency: 1, 
      every: record.every || 30*1000 
    });
    q.push(recursivelyPush);

    function recursivelyPush(){
      q.push(recursivelyPush);
    }
  });
}

function worker(name, url, callback) {
  url = URL.parse(url);
  var req = http.request({
    host: url.hostname,
    path: url.path,
    method:'GET',
    headers: { 'User-Agent':'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
               'Accept':'text/html,application/xhtml+xml,application/json' }
  }, function responseCallback(response){
      var fullResponse = '';
      response.on('data',function(chunk){
        fullResponse += chunk;
      });
      response.on('end', function(){
        var stmt = db.prepare("INSERT INTO records (timestamp, name, response) VALUES (?, ?, ?)");
        stmt.run((new Date()).getTime(), name, fullResponse);
        stmt.finalize();
        console.log('['+response.statusCode+'] ' + name);
        if(callback){
          callback(fullResponse);
        }
      });
      response.on('error', function(err){
        console.log(JSON.stringify(err));
      });
  });
  req.on('error', (err) => console.warn('Error: ',err));
  req.end();
}

function createWorker(name, url) {
  return function(callback){
    worker(name, url, callback);
  }
}

setup();