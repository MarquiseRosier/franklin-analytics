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
    let key;
    let val1;
    let val2;
    if(idx%3 === 0
      && nodeList.length%3 === 0
      && idx+1 <= nodeList.length
      && idx+2 <= nodeList.length 
      && (nodeList[idx+1].firstChild.nodeType === 1 || nodeList[idx+1].firstChild.nodeType === 3)  
      && (nodeList[idx+1].firstChild.nodeName === "#text" || nodeList[idx+1].firstChild.nodeName === "A")
      && (nodeList[idx+2].firstChild.nodeType === 1 || nodeList[idx+2].firstChild.nodeType === 3)
      && (nodeList[idx+2].firstChild.nodeName === "#text" || nodeList[idx+2].firstChild.nodeName === "A")){
      key = cell.firstChild;
      while(key.firstChild) {key = key.firstChild;}
      val1 = nodeList[idx+1].firstChild;
      while(val1.firstChild) {val1 = val1.firstChild;}
      val2 = nodeList[idx+2].firstChild;
      while(val2.firstChild) {val2 = val2.firstChild;}
      
      propDict[key.data.toLowerCase()] = [val1.data.toLowerCase(), val2.data.toLowerCase()];
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
    const legend = propDict['label'][0];
    const labelKey = propDict['label'][1];
    const chartId = propDict['data'].join('-') + '-' + propDict['type'].join('-'); //id is data row + chart type because why have this twice?
    
    //construct canvas where chart will sit
    const canvasWrapper = document.createElement('div');
    canvasWrapper.style = 'width: 50vw; height: 50vh';
    canvasWrapper.id = chartId;
    block.append(canvasWrapper);

    const paramData = new URLSearchParams();
    Object.entries(paramsObj).forEach(([param, val]) => {
      paramData.append(param, val);
    });
    
    const min = axisDict[tableColumn][0];
    const max = axisDict[tableColumn][1];

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
      var myChart = echarts.init(document.getElementById('${chartId}'), null, {
        renderer:'svg'
      });
      var labels = res.map(row => row.${labelKey});
      var series = res.map(row => row.${tableColumn});
  
      // Specify the configuration items and data for the chart
      var option = ${chartPicker(typeChart, chartOrientation, tableColumn, legend, min, max)}
    
      // Display the chart using the configuration items and data just specified.
      myChart.setOption(option);

      document.getElementById('${chartId}').querySelectorAll('svg > g > text[x="0"][y="0"]').forEach((cell, idx, nodeList) => {
        cell.innerHTML = '<a href="/views/rework-block?url=' + cell.innerHTML + '&' + '${paramData.toString()}">' + cell.innerHTML + '</a>';
      })
  });`
    
    block.append(echartsScript);
  }
}

const chartPicker = (typeChart, chartOrientation, tableColumn, legend, min, max) => {
  const CHART_CONFIG = {
    'bar-horizontal': `{
      title: {
      text: '${legend}'
      },
      tooltip: {},
      legend: {
      data: ['${tableColumn}']
      },
      xAxis: {
        min: ${min},
        max: ${max},
      },
      yAxis: {
        data: labels,
        triggerEvent: true,
      },
      series: [
        {
          name: '${tableColumn}',
          type: '${typeChart}',
          data: series,
        }
      ]
    };`,

    'bar-vertical': `{
      title: {
      text: '${legend}'
      },
      tooltip: {},
      legend: {
      data: ['${tableColumn}']
      },
      xAxis: {
        data: labels,
        triggerEvent: true,
      },
      yAxis: {
        min: ${min},
        max: ${max},
      },
      series: [
        {
          name: '${tableColumn}',
          type: '${typeChart}',
          data: series,
        }
      ]
    };`,

    'line-line': `{
      title: {
      text: '${legend}'
      },
      tooltip: {},
      legend: {
      data: ['${tableColumn}']
      },
      xAxis: {
        data: labels,
        triggerEvent: true,
      },
      yAxis: {
        min: ${min},
        max: ${max},
      },
      series: [
        {
          name: '${tableColumn}',
          type: '${typeChart}',
          data: series,
        }
      ]
    };`
  }
  return CHART_CONFIG[[typeChart, chartOrientation].join('-')];
}
