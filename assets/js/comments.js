// Система комментариев для DogNamedSchweppes
// Подключение к Supabase

class CommentsSystem {
    constructor(supabaseUrl, supabaseKey) {
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
    }

    // Получить все комментарии
    async getComments() {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/comments?order=created_at.desc`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки комментариев:', error);
            return [];
        }
    }

    // Добавить комментарий
    async addComment(page, author, text, link) {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/comments`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    page: page,
                    author: author,
                    text: text,
                    link: link || null,
                    created_at: new Date().toISOString()
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Ошибка добавления комментария:', error);
            return false;
        }
    }
}

// UI для комментариев
class CommentsUI {
    constructor(commentsSystem, containerId) {
        this.system = commentsSystem;
        this.container = document.getElementById(containerId);
        this.currentPage = this.getCurrentPage();
    }

    getCurrentPage() {
        const path = window.location.pathname.split("/").pop().replace(".html", "");
        return path || "index";
    }

    // Отрисовать комментарии
    async render() {
        if (!this.container) {
            console.error('Контейнер комментариев не найден!');
            return;
        }

        const comments = await this.system.getComments();

        const html = `
            <div class="comments-section">
                <div class="comments-header" >
                    <span data-i18n="comments_title">ЯЩИК ПРЕДЛОЖЕНИЙ</span> (${comments.length})
                </div>

                <div class="comments-form">
                    <input type="text" id="comment-author" placeholder="Имя" maxlength="30" required>
                    <textarea id="comment-link" placeholder="Ссылка на вас (необязательно)" maxlength="200" rows="2"></textarea>
                    <textarea id="comment-text" placeholder="Напиши что-нибудь..." maxlength="500" rows="2"></textarea>
                    <button onclick="commentsUI.submitComment()" class="yee-haw-button">
                        <span data-i18n="comments_submit">Отправить</span>
                    </button>
                </div>

                <div class="comments-list">
                    ${comments.map(c => this.renderComment(c)).join('')}
                </div>
            </div>
        `;

        this.container.innerHTML = html;
    }

    renderComment(comment) {
        const date = new Date(comment.created_at).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Имя с ссылкой или без
        const authorHtml = comment.link
            ? `<a href="${this.escapeHtml(comment.link)}" class="comment-author-link" target="_blank" rel="noopener noreferrer">${this.escapeHtml(comment.author)}</a>`
            : `<span class="comment-author">${this.escapeHtml(comment.author)}</span>`;

        return `
            <div class="comment">
                <div class="comment-header">
                    ${authorHtml}
                    <span class="comment-meta">
                        <a href="${comment.page}.html" class="comment-page-link">${comment.page}</a> · ${date}
                    </span>
                </div>
                <div class="comment-text">${this.escapeHtml(comment.text)}</div>
            </div>
        `;
    }

    async submitComment() {
        const author = document.getElementById('comment-author').value.trim();
        const link = document.getElementById('comment-link').value.trim();
        const text = document.getElementById('comment-text').value.trim();

        // Валидация
        if (!author) {
            alert('Введи имя!');
            return;
        }

        if (!text) {
            alert('Напиши что-нибудь!');
            return;
        }

        if (text.length < 2) {
            alert('Слишком короткий комментарий!');
            return;
        }

        // Отправка
        const success = await this.system.addComment(this.currentPage, author, text, link);

        if (success) {
            // Очистка формы
            document.getElementById('comment-author').value = '';
            document.getElementById('comment-link').value = '';
            document.getElementById('comment-text').value = '';
            // Перезагрузка комментариев
            await this.render();
        } else {
            alert('Ошибка при отправке комментария!');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Глобальные переменные
let commentsSystem;
let commentsUI;

// Функция инициализации
function initComments(supabaseUrl, supabaseKey) {
    commentsSystem = new CommentsSystem(supabaseUrl, supabaseKey);
    commentsUI = new CommentsUI(commentsSystem, 'comments-container');
    commentsUI.render();
}
