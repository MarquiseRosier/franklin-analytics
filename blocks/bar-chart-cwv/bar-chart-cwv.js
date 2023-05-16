export default function decorate(block) {
  const propDict = {};
  const legendDict = {
    'avgfid': 'First Input Delay',
    'avglcp': 'Largest Contentful Paint',
    'avgcls': 'Cumulative Layout Shift'
  }
  const axisDict = {
    'avgfid': [0, 100],
    'avgcls': [0, 0.75],
    'avglcp': [0, 4000],
  }
  block.querySelectorAll(':scope > div > div').forEach((cell, idx, nodeList) => {
    if(idx%2 === 0 
      && nodeList.length%2 === 0
      && idx+1 <= nodeList.length 
      && cell.firstChild.nodeType === 3 
      && cell.firstChild.nodeName === "#text"
      && nodeList[idx+1].firstChild.nodeType === 3 
      && nodeList[idx+1].firstChild.nodeName === "#text"){
      propDict[cell.firstChild.data.toLowerCase()] = nodeList[idx+1].firstChild.data.toLowerCase();
      nodeList[idx].parentElement.remove()
      nodeList[idx+1].parentElement.remove();
    }
  })

  if(Object.keys(propDict).length >= 3){
    const chartId = propDict['chart-id'];
    const endpoint = propDict['table-name'];
    const domainKey = propDict['domain-key'];
    const tableColumn = propDict['column-name'];

    const canvasWrapper = document.createElement('div');
    canvasWrapper.style = 'width: 50vw; height: 50vh';
    canvasWrapper.id = chartId;
    block.append(canvasWrapper);

    const paramData = new URLSearchParams();
    paramData.append('domainkey', domainKey);
    paramData.append('startdate', '2023-01-01');
    paramData.append('enddate', '2023-05-14');
    paramData.append('limit', 10);
    
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
            tick: 10,
          },
          yAxis: {
            data: labels
          },
          series: [
            {
              name: '${tableColumn}',
              type: 'bar',
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