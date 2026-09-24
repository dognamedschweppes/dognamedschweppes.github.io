class CommentsSystem {
    constructor(supabaseUrl, supabaseKey) {
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.endpoint = `${supabaseUrl}/rest/v1/comments`;
    }

    async request(path = '', options = {}) {
        const headers = {
            apikey: this.supabaseKey,
            Authorization: `Bearer ${this.supabaseKey}`,
            ...options.headers,
        };

        try {
            const response = await fetch(`${this.endpoint}${path}`, {
                ...options,
                headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response;
        } catch (error) {
            console.error('Ошибка запроса к Supabase:', error);
            throw error;
        }
    }

    async getComments() {
        try {
            const response = await this.request('?order=created_at.desc');
            return await response.json();
        } catch {
            return [];
        }
    }

    async addComment(page, author, text, link) {
        try {
            await this.request('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Prefer: 'return=minimal',
                },
                body: JSON.stringify({
                    page,
                    author,
                    text,
                    link: link || null,
                    created_at: new Date().toISOString(),
                }),
            });

            return true;
        } catch {
            return false;
        }
    }
}

class CommentsUI {
    constructor(commentsSystem, containerId) {
        this.system = commentsSystem;
        this.container = document.getElementById(containerId);
        this.currentPage = this.getCurrentPage();
    }

    getCurrentPage() {
        const page = window.location.pathname.split('/').pop()?.replace(/\.html$/i, '');
        return page || 'index';
    }

    async render() {
        if (!this.container) {
            console.error('Контейнер комментариев не найден!');
            return;
        }

        const comments = await this.system.getComments();
        this.container.innerHTML = this.renderLayout(comments.length);

        const button = this.container.querySelector('.comments-button');
        button?.addEventListener('click', () => this.submitComment());

        const list = this.container.querySelector('.comments-list');

        if (list) {
            comments.forEach(comment => {
                list.appendChild(this.createCommentElement(comment));
            });
        }

        this.applyTranslations();
    }

    renderLayout(commentsCount) {
        return `
            <div class="comments-header">
                <span data-i18n="comments_title">ЯЩИК ПРЕДЛОЖЕНИЙ</span><br>
                <span class="comments-count">(${commentsCount})</span>
            </div>

            <div class="comments-form">
                <input type="text" id="comment-author" data-i18n-placeholder="comment_name_placeholder" placeholder="Имя" maxlength="30" required>
                <textarea id="comment-link" data-i18n-placeholder="comment_link_placeholder" placeholder="Ссылка на вас (необязательно)" maxlength="200" rows="2"></textarea>
                <textarea id="comment-text" data-i18n-placeholder="comment_text_placeholder" placeholder="Напиши что-нибудь..." maxlength="500" rows="2"></textarea>
                <button type="button" class="comments-button">
                    <span data-i18n="comments_submit">Отправить</span>
                </button>
            </div>

            <div class="comments-list"></div>
        `;
    }

    createCommentElement(comment) {
        const wrapper = document.createElement('div');
        wrapper.className = 'comment';

        const header = document.createElement('div');
        header.className = 'comment-header';

        const author = comment.link
            ? this.createLink(comment.author, comment.link, 'comment-author-link', { external: true })
            : this.createElement('span', comment.author, 'comment-author');

        const meta = document.createElement('span');
        meta.className = 'comment-meta';

        const pageLink = this.createLink(comment.page, `${comment.page}.html`, 'comment-page-link');
        const date = this.createElement('div', this.formatDate(comment.created_at), 'comment-date');

        meta.append(pageLink, ' ', date);
        header.append(author, ' ', meta);

        const text = this.createElement('div', comment.text, 'comment-text');

        wrapper.append(header, text);
        return wrapper;
    }

    createElement(tag, text, className) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        element.textContent = text;
        return element;
    }

    createLink(text, href, className, { external = false } = {}) {
        const link = this.createElement('a', text, className);
        link.href = href;

        if (external) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }

        return link;
    }

    formatDate(value) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    async submitComment() {
        const authorInput = this.container.querySelector('#comment-author');
        const linkInput = this.container.querySelector('#comment-link');
        const textInput = this.container.querySelector('#comment-text');

        if (!authorInput || !linkInput || !textInput) return;

        const author = authorInput.value.trim();
        const link = linkInput.value.trim();
        const text = textInput.value.trim();

        const validationError = this.validateComment(author, text);
        if (validationError) {
            alert(validationError);
            return;
        }

        const success = await this.system.addComment(this.currentPage, author, text, link);

        if (!success) {
            alert('Ошибка при отправке комментария!');
            return;
        }

        const list = this.container.querySelector('.comments-list');

        if (list) {
            list.prepend(this.createCommentElement({
                page: this.currentPage,
                author,
                text,
                link: link || null,
                created_at: new Date().toISOString(),
            }));

            this.updateCount(1);
        }

        authorInput.value = '';
        linkInput.value = '';
        textInput.value = '';
    }

    validateComment(author, text) {
        if (!author) return 'Введи имя!';
        if (!text) return 'Напиши что-нибудь!';
        if (text.length < 2) return 'Слишком короткий комментарий!';
        return null;
    }

    updateCount(delta) {
        const countElement = this.container.querySelector('.comments-count');
        if (!countElement) return;

        const current = Number.parseInt(countElement.textContent.replace(/\D/g, ''), 10) || 0;
        countElement.textContent = `(${current + delta})`;
    }

    applyTranslations() {
        if (typeof updatePageLanguage === 'function') {
            updatePageLanguage();
        }
    }
}

let commentsSystem;
let commentsUI;

function initComments(supabaseUrl, supabaseKey) {
    commentsSystem = new CommentsSystem(supabaseUrl, supabaseKey);
    commentsUI = new CommentsUI(commentsSystem, 'comments-container');
    commentsUI.render();
}