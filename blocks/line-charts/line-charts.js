export default function decorate(block) {
    const canvas = document.createElement('canvas');
    /*const row = block.children[0];
    if (row.children.length === 2) {
      canvas.id = 'mychart'
    }
    */
    const canvasWrapper = createElement('div');
    canvas.id = 'mychart';
    canvasWrapper.appendChild(canvas);
    block.append(canvasWrapper);

    document.querySelectorAll(':scope > div > div').forEach((cell) => {
        const ctx = document.getElementById('mychart');

        new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
              datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                borderWidth: 1
              }]
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
    });
}