// Конфигурация Supabase для комментариев
const SUPABASE_CONFIG = {
    url: 'https://bmkpaqmzbwyeqvnolzji.supabase.co',
    key: 'sb_publishable_aRLUFg0oyQ764ryaNBjKBg_Nn4nhjR1'
};

// Автоматическая инициализация комментариев при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Небольшая задержка чтобы дождаться загрузки других компонентов
    setTimeout(function() {
        const container = document.getElementById('comments-container');
        if (container) {
            console.log('Инициализация комментариев...');
            initComments(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
        } else {
            console.error('Контейнер comments-container не найден!');
        }
    }, 100);
});
