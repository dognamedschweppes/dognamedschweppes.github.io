let commentsConfig = null;
let commentsContainer = null;

function getCurrentPage() {
    return window.location.pathname.split('/').pop()?.replace(/\.html$/i, '') || 'index';
}

function authHeaders() {
    return {
        apikey: commentsConfig.key,
        Authorization: `Bearer ${commentsConfig.key}`,
    };
}

async function fetchComments() {
    const response = await fetch(
        `${commentsConfig.url}/rest/v1/comments?order=created_at.desc`,
        { headers: authHeaders() }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

async function postComment({ page, author, text, link }) {
    const response = await fetch(`${commentsConfig.url}/rest/v1/comments`, {
        method: 'POST',
        headers: {
            ...authHeaders(),
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
        },
        body: JSON.stringify({ page, author, text, link: link || null }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

function formatCommentDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(getCurrentLanguage(), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function buildCommentElement(comment) {
    const wrapper = document.createElement('div');
    wrapper.className = 'comment';

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

    const meta = document.createElement('span');
    meta.className = 'comment-meta';

    const pageLink = document.createElement('a');
    pageLink.href = `${comment.page}.html`;
    pageLink.className = 'comment-page-link';
    pageLink.textContent = comment.page;

    const date = document.createElement('div');
    date.className = 'comment-date';
    date.textContent = formatCommentDate(comment.created_at);

    meta.append(pageLink, ' ', date);
    header.append(author, ' ', meta);

    const text = document.createElement('div');
    text.className = 'comment-text';
    text.textContent = comment.text;

    wrapper.append(header, text);
    return wrapper;
}

function renderCommentsLayout(count) {
    return `
        <div class="comments-header">
            <span data-i18n="comments_title">ЯЩИК ПРЕДЛОЖЕНИЙ</span><br>
            <span class="comments-count">(${count})</span>
        </div>

        <div class="comments-form">
            <input type="text" id="comment-author" data-i18n-placeholder="comment_name_placeholder"
                   placeholder="Имя" maxlength="30" required>
            <textarea id="comment-link" data-i18n-placeholder="comment_link_placeholder"
                      placeholder="Ссылка на вас (необязательно)" maxlength="200" rows="2"></textarea>
            <textarea id="comment-text" data-i18n-placeholder="comment_text_placeholder"
                      placeholder="Напиши что-нибудь..." maxlength="500" rows="2"></textarea>
            <button type="button" class="comments-button">
                <span data-i18n="comments_submit">Отправить</span>
            </button>
        </div>

        <div class="comments-list"></div>
    `;
}

function updateCommentsCount(delta) {
    const counter = commentsContainer.querySelector('.comments-count');
    if (!counter) return;

    const current = Number(counter.textContent.replace(/\D/g, '')) || 0;
    counter.textContent = `(${current + delta})`;
}

function validateComment(author, text) {
    if (!author) return 'Введи имя!';
    if (!text) return 'Напиши что-нибудь!';
    if (text.length < 2) return 'Слишком короткий комментарий!';
    return null;
}

async function submitComment() {
    const author = document.getElementById('comment-author').value.trim();
    const link = document.getElementById('comment-link').value.trim();
    const text = document.getElementById('comment-text').value.trim();

    const error = validateComment(author, text);
    if (error) {
        alert(error);
        return;
    }

    const page = getCurrentPage();

    try {
        await postComment({ page, author, text, link: link || null });
    } catch (err) {
        console.error(err);
        alert('Ошибка при отправке комментария!');
        return;
    }

    const list = commentsContainer.querySelector('.comments-list');
    list.prepend(buildCommentElement({
        page,
        author,
        text,
        link: link || null,
        created_at: new Date().toISOString(),
    }));
    updateCommentsCount(1);

    document.getElementById('comment-author').value = '';
    document.getElementById('comment-link').value = '';
    document.getElementById('comment-text').value = '';
}

async function renderComments() {
    let comments = [];
    try {
        comments = await fetchComments();
    } catch (error) {
        console.error('Не удалось загрузить комментарии:', error);
    }

    commentsContainer.innerHTML = renderCommentsLayout(comments.length);
    commentsContainer.querySelector('.comments-button')
        .addEventListener('click', submitComment);

    const list = commentsContainer.querySelector('.comments-list');
    const fragment = document.createDocumentFragment();
    for (const comment of comments) {
        fragment.appendChild(buildCommentElement(comment));
    }
    list.appendChild(fragment);

    applyTranslations();
}

function initComments(config) {
    commentsConfig = config;
    commentsContainer = document.getElementById('comments-container');
    if (commentsContainer) renderComments();
}