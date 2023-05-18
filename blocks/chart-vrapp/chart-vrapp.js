export default function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  const paramsObj = Array.from(params.keys()).reduce(
    (acc, val) => ({ ...acc, [val]: params.get(val) }),
    {},
  );
  const propDict = {};

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

      propDict[key.data.toLowerCase()] = [val1.data.toLowerCase(), val2.data];
      nodeList[idx].parentElement.remove();
      nodeList[idx + 1].parentElement.remove();
      nodeList[idx + 2].parentElement.remove();
    }
  });

  if (Object.keys(propDict).length >= 3) {
    // we extract the data from the block md
    const typeChart = propDict.type[0];
    const chartOrientation = propDict.type[1];
    const endpoint = propDict.data[0];
    const tableColumn = propDict.data[1];
    const linkRelativePath = propDict.link[0];
    const linkDataUrl = propDict.link[1];
    const legend = propDict.label[0];
    const labelKey = propDict.label[1];
    block.id = propDict.id[0];
    const chartId = `${propDict.data.join('-')}-${propDict.type.join('-')}`.toLowerCase(); // id is data row + chart type because why have this twice?


    const datePicker = document.querySelectorAll('#dateform');
    if(datePicker.length === 0){
      var dateForm = document.createElement('form');
      dateForm.id = 'dateform';
      var startDate = document.createElement('input');
      var startLabel = document.createElement('label');
      startLabel.textContent = 'start date';
      startLabel.id = 'start';
      startDate.type = "date";
      startDate.id = "startdate";
      startDate.className = "pickStart"; 
      dateForm.appendChild(startLabel);
      dateForm.appendChild(startDate);

      var endDate = document.createElement('input');
      var endLabel = document.createElement('label');
      endLabel.textContent = 'end date';
      endLabel.id = 'end';
      endDate.type = "date";
      endDate.id = "enddate";
      endDate.className = "pickEnd"; 
      dateForm.appendChild(endLabel);
      dateForm.appendChild(endDate);

      block.parentElement.parentElement.append(dateForm);
    }

    // construct canvas where chart will sit
    const canvasWrapper = document.createElement('div');
    canvasWrapper.style = 'width: 50vw; height: 50vh';
    canvasWrapper.id = chartId;
    block.append(canvasWrapper);

    const paramData = new URLSearchParams();
    Object.entries(paramsObj).forEach(([param, val]) => {
      paramData.append(param, val);
    });

    if(!paramData.has('url')){
      paramData.append('url','adobecom/bacom');
    }

    const echartsScript = document.createElement('script');
    echartsScript.type = 'text/partytown';
    //echartsScript.src ='../../scripts/request-rum.js'
    echartsScript.async = true;
    echartsScript.innerHTML = `
    function transformDataIntoMap(results){
      const transformed = {};
      const key = 'owner_repo' in results[0] ? 'owner_repo' : 'repo';
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
  
    //if this set is smaller than original set; than we toggle prev button, since there's more.
    function last30Days(arr){
        let last30DaysArr;
        if(arr && arr.length > 30){
            const lastElement = arr[arr.length - 1];
            const lastDate = ymd2Date(lastElement.year, lastElement.month, lastElement.day);
            last30DaysArr = arr.filter((el) => {
                const currDate = ymd2Date(el.year, el.month, el.day);
                return numDaysBetween(lastDate, currDate) <= 30;
            });
        }
        return last30DaysArr ? last30DaysArr : arr;
    }
  
    function next30Days(arr, prevLast){
        const firstElement = prevLast;
        const firstDate = ymd2Date(firstElement.year, firstElement.month, firstElement.day);
        const next30DaysArr = arr.filter((el) => {
            const currDate = ymd2Date(el.year, el.month, el.day);
            return currDate >= firstDate && numDaysBetween(firstDate, currDate) <= 30;
        });
        return next30DaysArr;
    }
  
    function prev30Days(arr, nextFirst){
        const lastElement = nextFirst;
        const lastDate = ymd2Date(lastElement.year, lastElement.month, lastElement.day);
        const prev30DaysArr = arr.filter((el) => {
            const currDate = ymd2Date(el.year, el.month, el.day);
            return currDate <= lastDate && numDaysBetween(lastDate, currDate) <= 30;
        })
        return prev30DaysArr;
    }
    
    (async function(){
      let res;
      if(!sessionStorage.getItem('${endpoint}')){
        const resp = await fetch('https://lqmig3v5eb.execute-api.us-east-1.amazonaws.com/helix-services/run-query/ci5237/${endpoint}', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: '${paramData}'
        });
        const data = await resp.json();
        res = transformDataIntoMap(data.results.data);
        sessionStorage.setItem('${endpoint}', JSON.stringify(res));
      }
      else{
        res = JSON.parse(sessionStorage.getItem('${endpoint}'));
      }
      let chartHandle = document.getElementById('${chartId}');
      var myChart = echarts.init(chartHandle, null, {
        renderer:'svg'
      });

      const plotData = res['${paramData.get('url')}'].sort(function(a,b){
        return ymd2Date(a.year, a.month, a.day) < ymd2Date(b.year, b.month, b.day)
      });
      
      var labels = last30Days(plotData).map(row => [row.year%2000, row.month, row.day].join('-'));
      var series = last30Days(plotData).map(row => row.${tableColumn});

      // Specify the configuration items and data for the chart
      var option = ${chartPicker(typeChart, chartOrientation, tableColumn, legend)}
    
      // Display the chart using the configuration items and data just specified.
      myChart.setOption(option);
      })()
    `;

    block.append(echartsScript);
  }
}

const chartPicker = (typeChart, chartOrientation, tableColumn, legend) => {
  const CHART_CONFIG = {
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
      },
      series: [
        {
          name: '${tableColumn}',
          type: '${typeChart}',
          data: series,
        }
      ]
    };`,
  };
  return CHART_CONFIG[[typeChart, chartOrientation].join('-')];
};
