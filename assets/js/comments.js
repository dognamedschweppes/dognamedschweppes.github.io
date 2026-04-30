class CommentsSystem {
    constructor(supabaseUrl, supabaseKey) {
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
    }

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

    async render() {
        if (!this.container) {
            console.error('Контейнер комментариев не найден!');
            return;
        }

        const comments = await this.system.getComments();

        const html = `
            <div class="comments-header" >
                <span data-i18n="comments_title">ЯЩИК ПРЕДЛОЖЕНИЙ</span> (${comments.length})
            </div>

            <div class="comments-form">
                <input type="text" id="comment-author" data-i18n-placeholder="comment_name_placeholder" placeholder="Имя" maxlength="30" required>
                <textarea id="comment-link" data-i18n-placeholder="comment_link_placeholder" placeholder="Ссылка на вас (необязательно)" maxlength="200" rows="2"></textarea>
                <textarea id="comment-text" data-i18n-placeholder="comment_text_placeholder" placeholder="Напиши что-нибудь..." maxlength="500" rows="2"></textarea>
                <button onclick="commentsUI.submitComment()" class="comments-button">
                    <span data-i18n="comments_submit">Отправить</span>
                </button>
            </div>

            <div class="comments-list">
                ${comments.map(c => this.renderComment(c)).join('')}
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

        const authorHtml = comment.link
            ? `<a href="${this.escapeHtml(comment.link)}" class="comment-author-link" target="_blank" rel="noopener noreferrer">${this.escapeHtml(comment.author)}</a>`
            : `<span class="comment-author">${this.escapeHtml(comment.author)}</span>`;

        return `
            <div class="comment">
                <div class="comment-header">
                    ${authorHtml}
                    <span class="comment-meta">
                        <a href="${comment.page}.html" class="comment-page-link">${comment.page}</a> <div class="comment-date">${date}</div>
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

        const success = await this.system.addComment(this.currentPage, author, text, link);

        if (success) {
            document.getElementById('comment-author').value = '';
            document.getElementById('comment-link').value = '';
            document.getElementById('comment-text').value = '';
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

let commentsSystem;
let commentsUI;

function initComments(supabaseUrl, supabaseKey) {
    commentsSystem = new CommentsSystem(supabaseUrl, supabaseKey);
    commentsUI = new CommentsUI(commentsSystem, 'comments-container');
    commentsUI.render();
}