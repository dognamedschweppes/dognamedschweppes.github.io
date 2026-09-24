const STORAGE_KEYS = {
    autosaveStatus: 'schweppes_autosave_status',
    manualSave: 'schweppes_manual_save',
    autosave: 'schweppes_autosave',
};

const AUTOSAVE_ICON = {
    on: '✓',
    off: '?',
};

async function fetchText(file) {
    const response = await fetch(file);

    if (!response.ok) {
        throw new Error(`Не удалось загрузить ${file}: ${response.status} ${response.statusText}`);
    }

    return response.text();
}

function runInlineScripts(container) {
    const scripts = Array.from(container.querySelectorAll('script:not([src])'));

    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');

        Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
        });

        newScript.textContent = oldScript.textContent;
        oldScript.replaceWith(newScript);
    });
}

async function loadComponent(id, file) {
    const target = document.getElementById(id);
    if (!target) return;

    try {
        target.innerHTML = await fetchText(file);
    } catch (error) {
        console.error(error);
        return;
    }

    if (id === 'footer-placeholder') {
        runInlineScripts(target);

        if (typeof updatePageLanguage === 'function') {
            updatePageLanguage();
        }

        if (typeof initComments === 'function' && typeof SUPABASE_CONFIG !== 'undefined') {
            const container = document.getElementById('comments-container');

            if (container) {
                console.log('Инициализация комментариев...');
                initComments(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
            }
        }
    }

    if (document.getElementById('autosave-icon')) {
        updateAutosaveUI();
    }
}

function getCurrentPage() {
    const page = window.location.pathname.split('/').pop()?.replace(/\.html$/i, '');
    return page || 'index';
}

let isAutosaveEnabled = localStorage.getItem(STORAGE_KEYS.autosaveStatus) === 'on';

function updateAutosaveUI() {
    const icon = document.getElementById('autosave-icon');
    if (!icon) return;

    icon.textContent = isAutosaveEnabled ? AUTOSAVE_ICON.on : AUTOSAVE_ICON.off;
}

function toggleAutosave() {
    isAutosaveEnabled = !isAutosaveEnabled;
    localStorage.setItem(STORAGE_KEYS.autosaveStatus, isAutosaveEnabled ? 'on' : 'off');
    updateAutosaveUI();
}

function saveGame() {
    const page = getCurrentPage();
    localStorage.setItem(STORAGE_KEYS.manualSave, page);
    alert(`Игра сохранена вручную: ${page}`);
}

const currentPage = getCurrentPage();

if (currentPage !== 'index' && isAutosaveEnabled) {
    localStorage.setItem(STORAGE_KEYS.autosave, currentPage);
}

function loadGame() {
    const manual = localStorage.getItem(STORAGE_KEYS.manualSave);
    const auto = localStorage.getItem(STORAGE_KEYS.autosave);
    const targetPage = manual || auto;

    if (targetPage && targetPage !== 'index') {
        window.location.href = `${targetPage}.html`;
    } else {
        alert('Сохранений не найдено!');
    }
}

function deleteSave() {
    if (!confirm('Удалить все данные игры?')) return;

    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    location.reload();
}

async function initApp() {
    await Promise.all([
        loadComponent('header-placeholder', 'header.html'),
        loadComponent('footer-placeholder', 'footer.html'),
    ]);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}