var logs = [],
  currencies = ['usd','eur','btc'],
  bindElements = ['supply','change'];

var chartElement = document.getElementById("ticker"),
    chartBox = chartElement.getBoundingClientRect(),
    chart = {
      x: d3.scale.linear().range([-1,chartBox.width+1]),
      y: d3.scale.linear().range([101,0]),
      svg: d3.select("#ticker")
              .append("g")
              .append("path")
                .attr("class","area")
                .attr("stroke-width",".5")
    };

function setElementText(id, text){
  var el = document.getElementById(id);
  el.innerHTML = text;
}

function grabData(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "http://eth-api.chrispthats.me/ether");
  xhr.setRequestHeader('response-limit','300');
  xhr.onreadystatechange = function(){
    if(xhr.readyState === 4 && xhr.status >= 200){
      var data = JSON.parse(xhr.responseText);
      logs = data;
      callback();
    } else if (xhr.readyState === 4) {
      console.warn("Error getting API", xhr.status);
    }
  }
  xhr.send();
}

function updateChart() {
  var mapped = logs.filter((item,index) => ((index % 10) === 0)).map(function(log, index){
    
    return {
      price: log.data.price['usd'],
      timestamp: parseFloat(log.timestamp)
    }
  });
  chart.x.domain(d3.extent(mapped, (d) => { return d.timestamp; }));
  chart.y.domain(d3.extent(mapped, (d) => { return d.price; }));
  var area = d3.svg.area()
          .x((d) => chart.x(d.timestamp) )
          .y0(200)
          .y1((d) => chart.y(d.price) );
  d3.select("#ticker .area").datum(mapped).attr("d", area);
}

function update() {
  updateChart();
  var currentStatus = logs[logs.length - 1].data;
  setElementText("change", currentStatus.change);
  setElementText("supply", currentStatus.supply);
}

function tick() {
  grabData(update);
}

tick();
setInterval(tick,30000);
