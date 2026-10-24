/* =========================================================================
   Comments widget — Supabase + vanilla JS
   ========================================================================= */

const COMMENTS_PAGE_SIZE = 100;

const COMMENT_LIMITS = {
    author: 30,
    body:   500,
    link:   200,
};

let apiConfig = null;
let rootEl = null;

/* ---------- HTTP ------------------------------------------------------- */

async function request(path, init = {}) {
    const response = await fetch(`${apiConfig.url}/rest/v1${path}`, {
        ...init,
        headers: {
            apikey: apiConfig.key,
            Authorization: `Bearer ${apiConfig.key}`,
            ...(init.headers || {}),
        },
    });

    if (!response.ok) {
        throw new Error(`Supabase ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

function fetchComments() {
    const query = new URLSearchParams({
        select:  'id,page,author,body,link,created_at',
        order:   'created_at.desc',
        limit:   String(COMMENTS_PAGE_SIZE),
    });
    return request(`/comments?${query}`);
}

async function createComment(payload) {
    const rows = await request('/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
        },
        body: JSON.stringify(payload),
    });
    return rows?.[0] ?? null;
}

/* ---------- Validation ------------------------------------------------- */

function validateComment({ author, body }) {
    if (!author)                                return 'comment_error_name_required';
    if (author.length > COMMENT_LIMITS.author)  return 'comment_error_name_too_long';
    if (!body)                                  return 'comment_error_text_required';
    if (body.length < 2)                        return 'comment_error_text_too_short';
    if (body.length > COMMENT_LIMITS.body)      return 'comment_error_text_too_long';
    return null;
}

// Returns a valid absolute URL, a mailto: link, or null.
function normalizeLink(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (trimmed.length > COMMENT_LIMITS.link) return null;

    // If it looks like an email, turn it into a mailto link.
    if (trimmed.includes('@') && !trimmed.includes('/')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(trimmed) ? `mailto:${trimmed}` : null;
    }

    // Otherwise, treat it as a URL and ensure it uses http(s).
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
        const url = new URL(candidate);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}

/* ---------- Rendering -------------------------------------------------- */

function formatDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(getCurrentLanguage(), {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
}

function buildComment(comment) {
    const el = document.createElement('div');
    el.className = 'comment';

    const header = document.createElement('div');
    header.className = 'comment-header';

    const author = document.createElement(comment.link ? 'a' : 'span');
    author.className = comment.link ? 'comment-author-link' : 'comment-author';
    author.textContent = comment.author;
    
    if (comment.link) {
        author.href = comment.link;
        author.target = '_blank';
        author.rel = 'noopener noreferrer';
    }

    const pageLink = document.createElement('a');
    pageLink.className = 'comment-page-link';
    pageLink.href = `${comment.page}.html`;
    pageLink.textContent = comment.page;

    const date = document.createElement('div');
    date.className = 'comment-date';
    date.textContent = formatDate(comment.created_at);

    const meta = document.createElement('div');
    meta.className = 'comment-meta';
    meta.append(pageLink, ' ', date);

    header.append(author, ' ', meta);

    const body = document.createElement('div');
    body.className = 'comment-text';
    body.textContent = comment.body;

    el.append(header, body);
    return el;
}

function buildShell(commentCount) {
    const shell = document.createElement('div');
    shell.innerHTML = `
        <div class="comments-header">
            <span data-i18n="comments_title">ЯЩИК ПРЕДЛОЖЕНИЙ</span><br>
            <span class="comments-count">(${commentCount})</span>
        </div>
        <div class="comments-form">
            <input type="text" id="comment-author" maxlength="30" required
                   data-i18n-placeholder="comment_name_placeholder" placeholder="Имя">
            <textarea id="comment-link" maxlength="200" rows="2"
                      data-i18n-placeholder="comment_link_placeholder"
                      placeholder="Ссылка (необязательно)"></textarea>
            <textarea id="comment-text" maxlength="500" rows="2" required
                      data-i18n-placeholder="comment_text_placeholder"
                      placeholder="Напиши что-нибудь..."></textarea>
            <button type="button" class="comments-button">
                <span data-i18n="comments_submit">Отправить</span>
            </button>
        </div>
        <div class="comments-list"></div>
    `;
    return shell.firstElementChild;
}

function addStatusMessage(list, messageKey, extraClass = '') {
    const el = document.createElement('div');
    el.className = `comment comment-${extraClass || 'status'}`;
    el.textContent = t(messageKey);
    list.append(el);
}

function updateCommentCount(list) {
    const counter = list.parentElement?.querySelector('.comments-count');
    if (!counter) return;
    const count = list.querySelectorAll('.comment:not(.comment-status):not(.comment-error)').length;
    counter.textContent = `(${count})`;
}

/* ---------- Submit flow ------------------------------------------------ */

function setSubmitState(button, submitting) {
    button.disabled = submitting;
    const label = button.querySelector('[data-i18n]') ?? button;
    label.textContent = t(submitting ? 'comments_submitting' : 'comments_submit');
}

function clearForm(form) {
    form.querySelectorAll('input, textarea').forEach(field => {
        field.value = '';
    });
}

async function submitComment(form, list) {
    const button = form.querySelector('.comments-button');
    if (button.disabled) return;

    const author  = form.querySelector('#comment-author').value.trim();
    const rawLink = form.querySelector('#comment-link').value.trim();
    const body    = form.querySelector('#comment-text').value.trim();

    const errorKey = validateComment({ author, body });
    if (errorKey) {
        alert(t(errorKey));
        return;
    }

    const link = normalizeLink(rawLink);
    if (rawLink && !link) {
        alert(t('comment_error_link_invalid'));
        return;
    }

    setSubmitState(button, true);

    try {
        const saved = await createComment({
            page: getCurrentPage(),
            author,
            body,
            link,
        });

        if (saved) {
            list.prepend(buildComment(saved));
            updateCommentCount(list);
            clearForm(form);
        } else {
            throw new Error('Empty representation from Supabase');
        }
    } catch (err) {
        console.error('[comments] submit failed:', err);
        alert(t('comment_error_send'));
    } finally {
        setSubmitState(button, false);
    }
}

/* ---------- Boot ------------------------------------------------------- */

async function renderComments() {
    if (!rootEl) return;

    let comments = [];
    let loadFailed = false;

    try {
        comments = await fetchComments();
    } catch (err) {
        console.error('[comments] load failed:', err);
        loadFailed = true;
    }

    const shell = buildShell(comments.length);
    rootEl.replaceChildren(shell);

    const form = shell.querySelector('.comments-form');
    const list = shell.querySelector('.comments-list');

    form.querySelector('.comments-button')
        .addEventListener('click', () => submitComment(form, list));

    if (loadFailed) {
        addStatusMessage(list, 'comment_error_load', 'error');
    } else if (comments.length === 0) {
        addStatusMessage(list, 'comments_empty', 'status');
    } else {
        const fragment = document.createDocumentFragment();
        for (const comment of comments) {
            fragment.append(buildComment(comment));
        }
        list.append(fragment);
    }

    applyTranslations();
}

function initComments(config) {
    if (!config?.url || !config?.key) {
        console.error('[comments] init skipped: invalid config');
        return;
    }

    apiConfig = config;
    rootEl = document.getElementById('comments-container');
    if (!rootEl) return;

    renderComments();
}