// Система комментариев для DogNamedSchweppes
// Подключение к Supabase

// Защищённые ники (только админ)
const PROTECTED_USERNAMES = ['Yaico_Belok', 'yaico_belok', 'YAICO_BELOK'];
const ADMIN_USERNAME = 'Yaico_Belok';

// Смайлики
const EMOJI_MAP = {
    ':p': '../media/images/emojis/tongue.gif',
    ':)': '../media/images/emojis/smile.gif',
    ':(': '../media/images/emojis/sad.gif',
    ':D': '../media/images/emojis/laugh.gif',
    ';)': '../media/images/emojis/wink.gif',
    ':o': '../media/images/emojis/surprised.gif',
    '<3': '../media/images/emojis/heart.gif',
    ':3': '../media/images/emojis/cat.gif'
};

class CommentsSystem {
    constructor(supabaseUrl, supabaseKey) {
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
    }

    // Получить комментарии для страницы
    async getComments(page) {
        // Получаем ВСЕ комментарии, не фильтруя по странице
        const response = await fetch(`${this.supabaseUrl}/rest/v1/comments?order=created_at.desc`, {
            headers: {
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${this.supabaseKey}`
            }
        });
        return await response.json();
    }

    // Добавить комментарий
    async addComment(page, author, text, link) {
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
                author: author || 'Аноним',
                text: text,
                link: link || null,
                created_at: new Date().toISOString()
            })
        });
        return response.ok;
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
        return window.location.pathname.split("/").pop().replace(".html", "") || "index";
    }

    // Отрисовать комментарии
    async render() {
        const comments = await this.system.getComments(this.currentPage);

        const html = `
            <div class="comments-section">
                <div class="comments-header">
                    <span data-i18n="comments_title">Комментарии</span> (${comments.length})
                </div>

                <div class="comments-form">
                    <input type="text" id="comment-author" placeholder="Имя" maxlength="30" required>
                    <input type="url" id="comment-link" placeholder="Ссылка на вас VK/Telegram/Discord/Neocities и т. д. (необязательно)" maxlength="200">
                    <textarea id="comment-text" placeholder="Напиши что-нибудь..." maxlength="500" rows="3"></textarea>
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

        // Проверяем, админ ли это
        const isAdmin = comment.author === ADMIN_USERNAME;
        const commentClass = isAdmin ? 'comment comment-admin' : 'comment';

        // Если есть ссылка, делаем имя кликабельным
        const adminBadge = isAdmin ? '<span class="admin-badge">👑 ADMIN</span>' : '';
        const authorHtml = comment.link
            ? `<a href="${this.escapeHtml(comment.link)}" class="comment-author-link" target="_blank" rel="noopener noreferrer">${this.escapeHtml(comment.author)}</a>`
            : `<span class="comment-author">${this.escapeHtml(comment.author)}</span>`;

        // Заменяем смайлики на картинки
        const textWithEmojis = this.replaceEmojis(this.escapeHtml(comment.text));

        return `
            <div class="${commentClass}">
                <div class="comment-header">
                    ${authorHtml}${adminBadge}
                    <span class="comment-meta">
                        <a href="${comment.page}.html" class="comment-page-link">${comment.page}</a> ${date}
                    </span>
                </div>
                <div class="comment-text">${textWithEmojis}</div>
            </div>
        `;
    }

    replaceEmojis(text) {
        let result = text;
        for (const [emoji, imgPath] of Object.entries(EMOJI_MAP)) {
            const regex = new RegExp(this.escapeRegex(emoji), 'g');
            result = result.replace(regex, `<img src="${imgPath}" class="emoji" alt="${emoji}" title="${emoji}">`);
        }
        return result;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    async submitComment() {
        const author = document.getElementById('comment-author').value.trim();
        const link = document.getElementById('comment-link').value.trim();
        const text = document.getElementById('comment-text').value.trim();

        if (!author) {
            alert('Введи имя!');
            return;
        }

        // Проверка на защищённые ники
        if (PROTECTED_USERNAMES.some(protected => author.toLowerCase() === protected.toLowerCase())) {
            alert('❌ Этот ник зарезервирован для администратора!');
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

// Глобальные переменные (будут инициализированы после настройки Supabase)
let commentsSystem;
let commentsUI;

// Функция инициализации (вызывается после загрузки страницы)
function initComments(supabaseUrl, supabaseKey) {
    commentsSystem = new CommentsSystem(supabaseUrl, supabaseKey);
    commentsUI = new CommentsUI(commentsSystem, 'comments-container');
    commentsUI.render();
}
