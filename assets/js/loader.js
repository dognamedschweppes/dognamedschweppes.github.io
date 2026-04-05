async function loadComponent(id, file) {
    const response = await fetch(file);
    const text = await response.text();
    document.getElementById(id).innerHTML = text;
    
    if (id === 'footer-placeholder') {
        const scripts = document.getElementById(id).getElementsByTagName('script');
        for (let script of scripts) {
            eval(script.text);
        }
    }
}

loadComponent('header-placeholder', 'header.html');
loadComponent('footer-placeholder', 'footer.html');
