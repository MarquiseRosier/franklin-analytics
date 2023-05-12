const CHARTJS = 'https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js';

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
  createInlineScriptSrc(CHARTJS, document.head);
}
