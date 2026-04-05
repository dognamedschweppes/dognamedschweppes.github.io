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

function saveGame() {
    const currentPage = window.location.pathname.split("/").pop().replace(".html", "");
    
    localStorage.setItem('my_comic_save', currentPage);
    alert("Игра сохранена на странице " + currentPage);
}

function loadGame() {
    const savedPage = localStorage.getItem('my_comic_save');
    
    if (savedPage) {
        window.location.href = savedPage + ".html";
    } else {
        alert("Сохранений не найдено!");
    }
}

function deleteSave() {
    if (confirm("Точно удалить сохранение?")) {
        localStorage.removeItem('my_comic_save');
        alert("Сохранение удалено.");
    }
}
