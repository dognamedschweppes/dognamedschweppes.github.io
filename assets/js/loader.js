// --- ЗАГРУЗКА КОМПОНЕНТОВ ---
async function loadComponent(id, file) {
    const response = await fetch(file);
    const text = await response.text();
    document.getElementById(id).innerHTML = text;
    
    // Если загрузился футер (или страница с кнопками), обновляем иконку галочки/вопроса
    if (id === 'footer-placeholder' || document.getElementById('autosave-icon')) {
        updateAutosaveUI();
    }

    if (id === 'footer-placeholder') {
        const scripts = document.getElementById(id).getElementsByTagName('script');
        for (let script of scripts) {
            eval(script.text);
        }
    }
}

loadComponent('header-placeholder', 'header.html');
loadComponent('footer-placeholder', 'footer.html');

// --- ЛОГИКА ИГРЫ ---

function getCurrentPage() {
    return window.location.pathname.split("/").pop().replace(".html", "") || "index";
}

// 1. СОСТОЯНИЕ АВТОСОХРАНЕНИЯ (ВКЛ/ВЫКЛ)
let isAutosaveEnabled = localStorage.getItem('schweppes_autosave_status') !== 'off';

function updateAutosaveUI() {
    const icon = document.getElementById('autosave-icon');
    if (icon) {
        icon.innerHTML = isAutosaveEnabled ? '✓' : '?';
    }
}

function toggleAutosave() {
    isAutosaveEnabled = !isAutosaveEnabled;
    localStorage.setItem('schweppes_autosave_status', isAutosaveEnabled ? 'on' : 'off');
    updateAutosaveUI();
}

// 2. ОБЫЧНОЕ СОХРАНЕНИЕ
function saveGame() {
    const page = getCurrentPage();
    localStorage.setItem('schweppes_manual_save', page);
    alert("Игра сохранена вручную: " + page);
}

// 3. АВТОСОХРАНЕНИЕ (срабатывает, только если включено)
const currentPage = getCurrentPage();
if (currentPage !== "index" && isAutosaveEnabled) {
    localStorage.setItem('schweppes_autosave', currentPage);
}

// 4. ЗАГРУЗКА
function loadGame() {
    const manual = localStorage.getItem('schweppes_manual_save');
    const auto = localStorage.getItem('schweppes_autosave');
    const targetPage = manual || auto;

    if (targetPage && targetPage !== "index") {
        window.location.href = targetPage + ".html";
    } else {
        alert("Сохранений не найдено!");
    }
}

// 5. УДАЛЕНИЕ
function deleteSave() {
    if (confirm("Удалить все данные игры?")) {
        localStorage.removeItem('schweppes_manual_save');
        localStorage.removeItem('schweppes_autosave');
        localStorage.removeItem('schweppes_autosave_status');
        location.reload(); 
    }
}
