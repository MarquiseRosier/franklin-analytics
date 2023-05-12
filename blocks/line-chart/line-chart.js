export default function decorate(block) {
    const canvasWrapper = document.createElement('div');
    canvasWrapper.id = 'mychart';
    canvasWrapper.style = "width: 600px; height: 400px;";
    block.append(canvasWrapper);
    
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