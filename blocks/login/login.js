export default function decorate(block) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('enter');
        }
      });
    });
    block.querySelectorAll(':scope > div > div').forEach((cell) => {
        cell.classList.add('login-content');
        const wrapper = document.createElement('div');
        wrapper.className = 'login-content-wrapper';
        while(cell.firstChild) wrapper.append(cell.firstChild)
        cell.append(wrapper)
    })
}