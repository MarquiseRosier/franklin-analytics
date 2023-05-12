export default function decorate(block) {
  const canvasWrapper = document.createElement('div');
  block.append(canvasWrapper);

    block.querySelectorAll(':scope > div > div').forEach((cell) => {
      if(cell.firstChild.nodeType === 3 && cell.firstChild.nodeName === "#text"){
        //this is a chart title. set id of a div to the title; 
        canvasWrapper.id = cell.firstChild.data;
      }

      if(cell.firstChild.nodeType === 1 && cell.firstChild.nodeName === "A"){
        //this is a link to a data source
      }
    })
    
    const echartsScript = document.createElement('script');
    echartsScript.type = 'text/partytown';
    echartsScript.innerHTML = `
    var myChart = echarts.init(document.getElementById('mychart'));

    // Specify the configuration items and data for the chart
    var option = {
      title: {
        text: 'A Start'
      },
      tooltip: {},
      legend: {
        data: ['sales']
      },
      xAxis: {
        data: ['Shirts', 'Cardigans', 'Chiffons', 'Pants', 'Heels', 'Socks']
      },
      yAxis: {},
      series: [
        {
          name: 'sales',
          type: 'bar',
          data: [5, 20, 36, 10, 10, 20]
        }
      ]
    };
    
    // Display the chart using the configuration items and data just specified.
    myChart.setOption(option);`

    block.append(echartsScript);
}
