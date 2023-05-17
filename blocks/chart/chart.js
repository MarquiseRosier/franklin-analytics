export default function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  const paramsObj = Array.from(params.keys()).reduce(
    (acc, val) => ({ ...acc, [val]: params.get(val) }),
    {}
  );
  const propDict = {};
  const legendDict = {
    'avgfid': 'First Input Delay',
    'avglcp': 'Largest Contentful Paint',
    'avgcls': 'Cumulative Layout Shift'
  }
  const axisDict = {
    'avgfid': [0, 100],
    'avgcls': [0, 0.8],
    'avglcp': [0, 4000],
  }
  block.querySelectorAll(':scope > div > div').forEach((cell, idx, nodeList) => {
    //get first element and link it to the other 2 in a row.
    let currData;
    if(idx%3 === 0
      && nodeList.length%3 === 0
      && idx+1 <= nodeList.length
      && idx+2 <= nodeList.length 
      && nodeList[idx+1].firstChild.nodeType === 3 
      && nodeList[idx+1].firstChild.nodeName === "#text"
      && nodeList[idx+2].firstChild.nodeType === 3 
      && nodeList[idx+2].firstChild.nodeName === "#text"){
      currData = cell.firstChild;
      while(currData.firstChild) {currData = currData.firstChild;}
      propDict[currData.data.toLowerCase()] = [nodeList[idx+1].firstChild.data.toLowerCase(), nodeList[idx+2].firstChild.data.toLowerCase()];
      nodeList[idx].parentElement.remove()
      nodeList[idx+1].parentElement.remove();
      nodeList[idx+2].parentElement.remove();
    }
  })

  if(Object.keys(propDict).length >= 3){
    //we extract the data from the block md
    const typeChart = propDict['type'][0];
    const chartOrientation = propDict['type'][1];
    const endpoint = propDict['data'][0];
    const tableColumn = propDict['data'][1];
    const linkRelativePath = propDict['link'][0];
    const linkDataUrl = propDict['link'][1];
    const chartId = propDict['data'].join('-') + '-' + propDict['type'].join('-'); //id is data row + chart type because why have this twice?
    
    //construct canvas where chart will sit
    const canvasWrapper = document.createElement('div');
    canvasWrapper.style = 'width: 50vw; height: 50vh';
    canvasWrapper.id = chartId;
    block.append(canvasWrapper);

    const paramData = new URLSearchParams();
    paramData.append('startdate', '2023-01-01');
    paramData.append('enddate', '2023-05-14');
    paramData.append('limit', 10);
    Object.entries(paramsObj).forEach(([param, val]) => {
      paramData.append(param, val);
    });
    
    const echartsScript = document.createElement('script');
    echartsScript.type = 'text/partytown';
    //echartsScript.src ='../../scripts/request-rum.js'
    echartsScript.innerHTML = `
    fetch('https://helix-pages.anywhere.run/helix-services/run-query@v3/${endpoint}', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: '${paramData}'
    })
    .then((res) => res.json())
    .then((data) => {
      const res = data.results.data;
      var myChart = echarts.init(document.getElementById('${chartId}'));
      var labels = res.map(row => row.url);
      var series = res.map(row => row.${tableColumn});
  
      // Specify the configuration items and data for the chart
      var option = {
          title: {
          text: '${legendDict[tableColumn]}'
          },
          tooltip: {},
          legend: {
          data: ['${tableColumn}']
          },
          xAxis: {
            min: ${axisDict[tableColumn][0]},
            max: ${axisDict[tableColumn][1]},
          },
          yAxis: {
            data: labels
          },
          series: [
            {
              name: '${tableColumn}',
              type: '${typeChart}',
              data: series,
            }
          ]
        };
    
      // Display the chart using the configuration items and data just specified.
      myChart.setOption(option);
  });`
    
    block.append(echartsScript);
  }
}

