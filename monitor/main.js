var logs = [],
  currencies = ['usd','eur','btc'],
  bindElements = ['supply','change'];

var chartElement = document.getElementById("ticker"),
    chart = {
  x: d3.scale.linear().range([-1,201]),
  y: d3.scale.linear().range([101,0]),
  svg: d3.select("#ticker")
          .append("g")
          .append("path")
            .attr("class","area")
            .attr("stroke-width",".5")
};

function grabData() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "http://eth-api.chrispthats.me/ether");
  xhr.onreadystatechange = function(){
    if(xhr.readyState === 4 && xhr.status >= 200){
      var data = JSON.parse(xhr.responseText);
      logs = data;
    } else if (xhr.readyState === 4) {
      console.warn("Error getting API", xhr.status);
    }
  }
  xhr.send();
}

function updateChart() {
  var mapped = logs.map(function(log, index){
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
  console.log(mapped);
  //window.localStorage.setItem("ETHPriceTracker", JSON.stringify(logs));
}

function update() {
  updateChart();
  /*
  bindElements.forEach((id)=>{
    var el = document.getElementById(id);
    //el.innerText = logs[id][0];
  });
  if(parseFloat(logs['change'][0]) > 0) {
    var el = document.getElementById('change-wrapper');
    el.classList.add('positive');
  } else {
    var el = document.getElementById('change-wrapper');
    el.classList.add('negative');
  }*/
}

function tick() {
  grabData();
  update();
}

tick();
setInterval(tick,5000)
