const STORAGE_KEYS = {
    autosaveStatus: 'schweppes_autosave_status',
    manualSave: 'schweppes_manual_save',
    autosave: 'schweppes_autosave',
};

const AUTOSAVE_ICON = { on: '✓', off: '?' };

let autosaveEnabled = localStorage.getItem(STORAGE_KEYS.autosaveStatus) === 'on';

function getCurrentPage() {
    return window.location.pathname.split('/').pop()?.replace(/\.html$/i, '') || 'index';
}

async function fetchText(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    return response.text();
}

// innerHTML doesn't execute <script> tags, so swap them for fresh nodes.
function activateInlineScripts(container) {
    container.querySelectorAll('script:not([src])').forEach(oldScript => {
        const fresh = document.createElement('script');
        for (const { name, value } of [...oldScript.attributes]) {
            fresh.setAttribute(name, value);
        }
        fresh.textContent = oldScript.textContent;
        oldScript.replaceWith(fresh);
    });
}

async function loadComponent(id, url) {
    const target = document.getElementById(id);
    if (!target) return;

    try {
        target.innerHTML = await fetchText(url);
    } catch (error) {
        console.error(error);
        return;
    }

    activateInlineScripts(target);
}

function renderAutosaveIcon() {
    const icon = document.getElementById('autosave-icon');
    if (icon) icon.textContent = autosaveEnabled ? AUTOSAVE_ICON.on : AUTOSAVE_ICON.off;
}

function toggleAutosave() {
    autosaveEnabled = !autosaveEnabled;
    localStorage.setItem(STORAGE_KEYS.autosaveStatus, autosaveEnabled ? 'on' : 'off');
    renderAutosaveIcon();
}

function saveGame() {
    const page = getCurrentPage();
    localStorage.setItem(STORAGE_KEYS.manualSave, page);
    alert(`Игра сохранена вручную: ${page}`);
}

function loadGame() {
    const page =
        localStorage.getItem(STORAGE_KEYS.manualSave) ||
        localStorage.getItem(STORAGE_KEYS.autosave);

    if (!page || page === 'index') {
        alert('Сохранений не найдено!');
        return;
    }
    window.location.href = `${page}.html`;
}

function deleteSave() {
    if (!confirm('Удалить все данные игры?')) return;

    for (const key of Object.values(STORAGE_KEYS)) {
        localStorage.removeItem(key);
    }
    location.reload();
}

async function initApp() {
    const currentPage = getCurrentPage();

    if (currentPage !== 'index' && autosaveEnabled) {
        localStorage.setItem(STORAGE_KEYS.autosave, currentPage);
    }

    await Promise.all([
        loadComponent('header-placeholder', 'header.html'),
        loadComponent('footer-placeholder', 'footer.html'),
    ]);

    renderAutosaveIcon();
    applyTranslations();

    if (typeof SUPABASE_CONFIG !== 'undefined') {
        initComments(SUPABASE_CONFIG);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}