export default function decorate(block) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('enter');
        }
      });
    });
    fetch('https://admin.hlx.page/profile/adobe/blog').then(res => res.json()).then((data) => {
        if(data.status = 401){
            block.querySelectorAll(':scope > div > div').forEach((cell) => {
                cell.classList.add('login-content');
                const link = document.createElement('a');
                link.href = data.links.login;
                link.target="popup"
                link.onclick=() => {window.open(data.links.login, 'popup', 'width=300,height=300'); return false}
                link.textContent = cell.firstChild.textContent;
                cell.append(link);
                cell.firstChild.remove();
            })
        }
    })
}