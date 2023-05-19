export default function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  const paramsObj = Array.from(params.keys()).reduce(
    (acc, val) => ({ ...acc, [val]: params.get(val) }),
    {},
  );
  const propDict = {};
  const axisDict = {
    avgfid: [0, 500],
    avgcls: [0, 0.45],
    avglcp: [0, 6],
  };

  const perfRanges = {
    'avgfid': {
      'good': [0, 100],
      'okay': [100, 300],
      'poor': [300],
    },
    'avgcls': {
      'good': [0, 0.1],
      'okay': [0.1, 0.25],
      'poor': [0.25],
    },
    'avglcp': {
      'good': [0, 2.5],
      'okay': [2.5, 4.0],
      'poor': [4.0],
    }
  }

  const urlBase = {
    'daily-rum': 'https://lqmig3v5eb.execute-api.us-east-1.amazonaws.com/helix-services/run-query/ci5189/',
    'rum-dashboard': 'https://helix-pages.anywhere.run/helix-services/run-query@v3/',
    'rum-pageviews': 'https://helix-pages.anywhere.run/helix-services/run-query@v3/'
  }

  block.querySelectorAll(':scope > div > div').forEach((cell, idx, nodeList) => {
    // get first element and link it to the other 2 in a row.
    let key;
    let val1;
    let val2;
    if (idx % 3 === 0
      && nodeList.length % 3 === 0
      && idx + 1 <= nodeList.length
      && idx + 2 <= nodeList.length
      && (nodeList[idx + 1].firstChild.nodeType === 1 || nodeList[idx + 1].firstChild.nodeType === 3)
      && (nodeList[idx + 1].firstChild.nodeName === '#text' || nodeList[idx + 1].firstChild.nodeName === 'A')
      && (nodeList[idx + 2].firstChild.nodeType === 1 || nodeList[idx + 2].firstChild.nodeType === 3)
      && (nodeList[idx + 2].firstChild.nodeName === '#text' || nodeList[idx + 2].firstChild.nodeName === 'A')) {
      key = cell.firstChild;
      while (key.firstChild) { key = key.firstChild; }
      val1 = nodeList[idx + 1].firstChild;
      while (val1.firstChild) { val1 = val1.firstChild; }
      val2 = nodeList[idx + 2].firstChild;
      while (val2.firstChild) { val2 = val2.firstChild; }
      propDict[key.data.toLowerCase()] = [val1.data.toLowerCase(), val2.data.toLowerCase()];
      nodeList[idx].parentElement.remove();
      nodeList[idx + 1].parentElement.remove();
      nodeList[idx + 2].parentElement.remove();
    }
  });

  if (Object.keys(propDict).length >= 3) {
    // we extract the data from the block md
    const typeChart = propDict.type[0];
    const extraChartInfo = propDict.type[1];
    const endpoint = propDict.data[0];
    const tableColumn = propDict.data[1];
    const linkRelativePath = propDict.link[0];
    const linkDataUrl = propDict.link[1];
    const legend = propDict.label[0];
    const labelKey = propDict.label[1];
    const chartId = `${propDict.data.join('-')}-${propDict.type.join('-')}`.toLowerCase(); // id is data row + chart type because why have this twice?
    const tableAndColumn = propDict.data.join('-');

    // construct canvas where chart will sit
    const canvasWrapper = document.createElement('div');
    canvasWrapper.style = "aspect-ratio: 1/1; height: 100%; width: 100%;"
    canvasWrapper.id = chartId;
    block.append(canvasWrapper);

    const paramData = new URLSearchParams();
    Object.entries(paramsObj).forEach(([param, val]) => {
      paramData.append(param, val);
    });

    const chartMin = axisDict[tableColumn][0];
    const chartMax = axisDict[tableColumn][1];

    const echartsScript = document.createElement('script');
    echartsScript.type = 'text/partytown';
    //echartsScript.src ='../../scripts/test.js'
    echartsScript.async = true;
    echartsScript.innerHTML = `
    (async function(){
      let chartHandle = document.getElementById('${chartId}');
      let res;
      const resp = await fetch('${urlBase[endpoint]}${endpoint}', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: '${paramData}'
        });
      const data = await resp.json();
      let myChart = echarts.init(chartHandle);
      ${engineerData(tableAndColumn, paramData, tableColumn, labelKey)}
      ${chartPicker(typeChart, extraChartInfo, tableColumn, perfRanges, legend, chartMin, chartMax)}
      ${engineerDom(tableAndColumn, chartId, paramData)}
      myChart.setOption(option);
      })()
    `;

    block.append(echartsScript);
  }
}

/**
 * 
 * @param {*} data 
 * @returns 
 */
function engineerData(tableAndColumn, paramData, tableColumn, labelKey){
  //tied to table name, column name, will determine how we handle data
  const commonPlots = `
  res = data.results.data;
  const labels = res.map(row => row.${labelKey});
  const series = res.map(row => row.${tableColumn});`

  const cashubCommonPlot = `
  function transformDataIntoMap(results){
    const transformed = {};
    const key = 'host';
    results.forEach((item) => {
        if(!(item[key] in transformed)){
            transformed[item[key]] = [item];
        }
        else if(item[key] in transformed){
            transformed[item[key]].push(item)
        }
    })
    return transformed;
  }

  function numDaysBetween(d1, d2) {
    var diff = Math.abs(d1.getTime() - d2.getTime());
    return diff / (1000 * 60 * 60 * 24);
  };

  function ymd2Date(year, month, day){
      return new Date(year, month, day);
  }
  res = transformDataIntoMap(data.results.data);

  let plotData;
  if(${paramData.has('url')} && ('${paramData.get('url')}' in res)){
    plotData = res['${paramData.get('url')}'];
  }else{
    Object.keys(res).forEach((k) => {
      if(!plotData && res[k].length >= 30){
        plotData = res[k];
      }
    });
  }
  plotData.sort(function(a,b){
    let lesser = ymd2Date(a.year, a.month, a.day) < ymd2Date(b.year, b.month, b.day);
    let greater = ymd2Date(a.year, a.month, a.day) < ymd2Date(b.year, b.month, b.day)
    if(lesser){
      return -1;
    }
    else if(greater){
      return 1;
    }
    else{
      return 0;
    }
  });

  let labels = plotData.map(row => [row.month, row.day, row.year%2000].join('-'));
  let series = plotData.map(row => row.${tableColumn} ${tableColumn === 'avglcp' ? ' > 6 ? 5.5 : row.avglcp' : ''});

  let currentUrl = plotData[0].host;

  let percentage = .50;
  let row = plotData[0];
  start = [row.month, row.day, row.year%2000].join('-');
  let amount = parseInt(plotData.length * percentage); 
  if(amount > 70){
    while(amount > 70){
      percentage = percentage - .05;
      amount = parseInt(plotData.length * percentage);
    }
    let row = plotData[plotData.length - amount];
    start = [row.month, row.day, row.year%2000].join('-');
  }`

  /* ------------------------------------------------------------------------- */
  //ADD MORE INLINE JS THAT HANDLES DATA FOR A DIFFERENT TYPE OF CHART BELOW!

  const DATA_CONFIG = {
    //non cashub queries
    'rum-dashboard-avglcp': `
          res = data.results.data;\n
          var labels = res.map(row => row.${labelKey});\n
          var series = res.map(row => row.${tableColumn}/1000);\n`,
    'rum-dashboard-avgfid': commonPlots,
    'rum-dashboard-avgcls': commonPlots,
    //cashub queries
    'daily-rum-avglcp': cashubCommonPlot,
    'daily-rum-avgfid': cashubCommonPlot,
    'daily-rum-avgcls': cashubCommonPlot,
  }


  return DATA_CONFIG[tableAndColumn];
}

function engineerDom(tableAndColumn, chartId, paramData){
  //make urls in chart selectable
  const urlChartDomOps = `\ndocument.getElementById('${chartId}').querySelectorAll('svg > g > text[x="0"][y="0"]').forEach((cell, idx, nodeList) => {
      cell.innerHTML = '<a href="/views/rework-block?url=' + cell.innerHTML + '&' + '${paramData.toString()}">' + cell.innerHTML + '</a>';
  });\n`

  const commonDomOps = `\nnew ResizeObserver(() => {
      myChart.resize();
    }).observe(chartHandle);\n`

  /* ------------------------------------------------------------------------- */
  //ADD ANOTHER SET OF INLINE JS THAT HANDLES DOM MANIPULATION BELOW.

  const DOM_CONFIG = {
    'rum-dashboard-avglcp': urlChartDomOps + commonDomOps,
    'rum-dashboard-avgfid': urlChartDomOps + commonDomOps,
    'rum-dashboard-avgcls': urlChartDomOps + commonDomOps,
    //cashub queries
    'daily-rum-avglcp': commonDomOps,
    'daily-rum-avgfid': commonDomOps,
    'daily-rum-avgcls': commonDomOps,
  }
  return DOM_CONFIG[tableAndColumn];
}

/**
 * 
 * @param {*} typeChart 
 * @param {*} extraChartInfo 
 * @param {*} tableColumn 
 * @param {*} legend 
 * @returns 
 */
const chartPicker = (typeChart, extraChartInfo, tableColumn, perfRanges, legend, min, max) => {
  const CHART_CONFIG = {
    'line-cashub': `{
      title: {
      text: currentUrl + ' ${legend}',
      x: 'center',
      top: 15,
      },
      xAxis: {
        data: labels,
        type: 'category',
      },
      dataZoom: [
        {
            id: 'dataZoomX',
            type: 'slider',
            startValue: start,
            filterMode: 'filter'
        }
      ],
      yAxis: {
        min: ${min},
        max: ${max},
      },
      series: [
        {
          name: '${tableColumn}',
          type: '${typeChart}',
          data: series,
          markLine: {
            symbol: 'none',
            data: [
              {
                name: 'Good',
                yAxis: ${perfRanges[tableColumn]['good'][1]},
                label: {
                  normal: {
                  show: true, 
                  }
                },
                lineStyle: {
                  width: 10,
                  normal: {
                    type:'dashed',
                    color: 'green',
                  }
                },
              },
              {
                name: 'Okay',
                yAxis: ${perfRanges[tableColumn]['okay'][1]},
                label: {
                  normal: {
                  show: true, 
                  }
                },
                lineStyle: {
                  width: 10,
                  normal: {
                    type:'dashed',
                    color: 'orange',
                  }
                },
              },
              {
                name: 'Poor',
                yAxis: ${perfRanges[tableColumn]['poor'][0]},
                label: {
                  normal: {
                  show: true, 
                  }
                },
                lineStyle: {
                  width: 10,
                  normal: {
                    type:'dashed',
                    color: 'red',
                  }
                },
              },
            ],
            areaStyle: {
              color: '#91cc75'
            }
          },
          markArea: {
            data: [
              [
                {
                  label: 'Good',
                  yAxis: ${perfRanges[tableColumn]['good'][0]}, //min of green area
                  itemStyle: {
                    color: 'rgba(23, 232, 30, 0.2)'
                  },
                },
                {
                  yAxis: ${perfRanges[tableColumn]['good'][1]}, //max of green area area
                }
              ],
              [
                {
                  name: 'Needs Improvement',
                  yAxis: ${perfRanges[tableColumn]['okay'][0]}, //min of green area
                  itemStyle: {
                    color: '#FEE7E6'
                  },
                },
                {
                  yAxis: ${perfRanges[tableColumn]['okay'][1]}, //max of green area area
                }
              ],
            ]
          },
        }
      ]
    };`,
    'bar-horizontal': `{
      title: {
        text: '${legend}',
        x: 'center',
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
      grid: {
        containLabel: true,
      },
      series: [
        {
          type: '${typeChart}',
          data: series,
        }
      ]
    };`,
  };
  return `var option = ` + CHART_CONFIG[[typeChart, extraChartInfo].join('-')];
};
