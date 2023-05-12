const ECHARTS = 'https://www.jsdelivr.com/package/npm/echarts';

function createInlineScriptHTML(innerHTML, parent) {
  const script = document.createElement('script');
  script.type = 'text/partytown';
  script.innerHTML = innerHTML;
  parent.appendChild(script);
}

function createInlineScriptSrc(src, parent){
  const script = document.createElement('script');
  script.type = 'text/partytown';
  script.src = src;
  parent.appendChild(script); 
}

export default function integrateEcharts() {
  createInlineScriptSrc(ECHARTS, document.body);
}
