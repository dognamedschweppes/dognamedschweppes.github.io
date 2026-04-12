// Система интернационализации
const translations = {
    ru: {
        // Навигация
        nav_map: "КАРТА",
        nav_fanarts: "ФАНАРТЫ",

        // Навигация по страницам
        nav_start: "Сначала",
        nav_back: "Назад",

        // Главная страница
        page_00001_text: "Вот клёвый рыженький паренёк в своей комнате. Так получилось, что сегодня, 12 Июля, у него День Рождения. Неожиданно, но у этого крутого пацанчика ещё нет имени! Так как же его будут звать?",
        page_00001_link: "Введите имя.",

        // Страница 00002
        page_00002_title: "Введите имя.",
        page_00002_text: "Полегче здоровяк.",
        page_00002_link: "Вторая попытка.",

        // Страница 00003
        page_00003_title: "Вторая попытка.",
        page_00003_link: "Осмотреть комнату.",

        // Страница 00004
        page_00004_title: "Осмотреть комнату.",
        page_00004_text: "Тебя зовут ЕГОР. Как уже было сказано, сегодня твой ДЕНЬ РОЖДЕНИЯ. У тебя абсолютно ноль УВЛЕЧЕНИЙ кроме ежедневных тренировок на которые ты забил. Ты любишь КРУТЫЕ sigma ФИЛЬМЫ и СЕРИАЛЫ. Тебе нравится чувствовать себя ЛУЧШЕ везде и во всём, но ЭТО НЕ ТАК. Ты не очень то и сильно любишь ИГРЫ, но иногда погамать - норм. Что ты будешь делать далее?",
        page_00004_link: "Егор: Изучить плакат с волком.",

        // Страница 00005
        page_00005_title: "Егор: Изучить плакат с волком.",
        page_00005_text: "Этот плакат мотивирует тебя быть крутым и одиноким волком. Никто не понимает тебя так как он. А как плакат вообще может кого-то понимать? Это уже тревожные звоночки.",
        page_00005_link: "Егор: Изучить плакат Берсерка.",

        // Страница 00006
        page_00006_title: "Егор: Изучить плакат Берсерка.",
        page_00006_text: "Одно из твоих альтер эго, в глубине души ты ЧЁРНЫЙ МЕЧНИК. Или просто придурок с 2х метровой палкой.",
        page_00006_link: "Егор: Порыться в мусорке.",

        // Страница 00007
        page_00007_title: "Егор: Порыться в мусорке.",
        page_00007_text: "Мусорка совершенно пуста. Прямо вылизана можно сказать. Обычно в твоей комнате много мусора, но не сейчас.",
        page_00007_link: "Егор: Осмотреть комод.",

        // Страница 00008
        page_00008_title: "Егор: Осмотреть комод.",
        page_00008_text: "На комоде твой ТЕЛЕФОН и ГИГИЕНИЧЕСКАЯ ПОМАДА. Хоть ты и sigma, но кому нравятся когда ты уже в 100й раз облизываешь свои ободранные губы? Вот именно что никому.",
        page_00008_link: "Егор: Подобрать гигиеническую помаду.",

        // Специальные страницы
        page_map_title: "Карта приключения",
        page_fanarts_title: "Фанарты",

        // Кнопки сохранения
        save_game: "Сохранить игру",
        save_tooltip: "Создает постоянную закладку на этой странице.",
        autosave: "Автосохранение!",
        autosave_tooltip: "Нажмите \"Автосохранение!\", чтобы включить/выключить автоматическую запись прогресса.",
        load_game: "Загрузить игру",
        delete_game: "Удалить игру",

        // Общее
        language: "Язык"
    },
    en: {
        // Navigation
        nav_map: "MAP",
        nav_fanarts: "FAN ARTS",

        // Page navigation
        nav_start: "Start",
        nav_back: "Back",

        // Main page
        page_00001_text: "Here's a cool ginger-haired guy in his room. It just so happens that today, July 12th, is his birthday. Surprisingly, this cool dude doesn't have a name yet! So what will he be called?",
        page_00001_link: "Enter name.",

        // Page 00002
        page_00002_title: "Enter name.",
        page_00002_text: "Easy there, big guy.",
        page_00002_link: "Second attempt.",

        // Page 00003
        page_00003_title: "Second attempt.",
        page_00003_link: "Examine room.",

        // Page 00004
        page_00004_title: "Examine room.",
        page_00004_text: "Your name is EGOR. As already mentioned, today is your BIRTHDAY. You have absolutely zero HOBBIES except for daily workouts that you've been skipping. You love COOL sigma MOVIES and TV SHOWS. You like to feel BETTER everywhere and in everything, but THAT'S NOT TRUE. You don't really love GAMES that much, but sometimes gaming is okay. What will you do next?",
        page_00004_link: "Egor: Examine the wolf poster.",

        // Page 00005
        page_00005_title: "Egor: Examine the wolf poster.",
        page_00005_text: "This poster motivates you to be a cool and lone wolf. Nobody understands you like it does. But how can a poster understand anyone at all? These are already warning signs.",
        page_00005_link: "Egor: Examine the Berserk poster.",

        // Page 00006
        page_00006_title: "Egor: Examine the Berserk poster.",
        page_00006_text: "One of your alter egos, deep down you are the BLACK SWORDSMAN. Or just a dumbass with a 2-meter stick.",
        page_00006_link: "Egor: Rummage through the trash.",

        // Page 00007
        page_00007_title: "Egor: Rummage through the trash.",
        page_00007_text: "The trash can is completely empty. Licked clean, you could say. Usually there's a lot of trash in your room, but not now.",
        page_00007_link: "Egor: Examine the dresser.",

        // Page 00008
        page_00008_title: "Egor: Examine the dresser.",
        page_00008_text: "On the dresser are your PHONE and LIP BALM. Even though you're sigma, who likes it when you lick your chapped lips for the 100th time? That's right, nobody.",
        page_00008_link: "Egor: Pick up the lip balm.",

        // Special pages
        page_map_title: "Adventure Map",
        page_fanarts_title: "Fan Arts",

        // Save buttons
        save_game: "Save Game",
        save_tooltip: "Creates a permanent bookmark on this page.",
        autosave: "Auto-Save!",
        autosave_tooltip: "Click \"Autosave!\" to enable/disable automatic progress saving.",
        load_game: "Load Game",
        delete_game: "Delete Game",

        // General
        language: "Language"
    }
};

// Получить текущий язык из localStorage или использовать русский по умолчанию
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'ru';
}

// Установить язык
function setLanguage(lang) {
    localStorage.setItem('language', lang);
    updatePageLanguage();
}

// Обновить все элементы на странице
function updatePageLanguage() {
    const lang = getCurrentLanguage();
    const t = translations[lang];

    // Обновляем все элементы с атрибутом data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (t[key]) {
            // Если это ссылка или кнопка, меняем текст
            if (element.tagName === 'A' || element.tagName === 'SPAN' || element.tagName === 'DIV') {
                element.textContent = t[key];
            }
        }
    });

    // Обновляем элементы с data-i18n-html (для HTML контента)
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
        const key = element.getAttribute('data-i18n-html');
        if (t[key]) {
            element.innerHTML = t[key];
        }
    });

    // Обновляем панели (картинки) с атрибутом data-i18n-img
    document.querySelectorAll('[data-i18n-img]').forEach(img => {
        const panelId = img.getAttribute('data-i18n-img');
        img.src = `../media/images/panels/${lang}/${panelId}.gif`;
    });

    // Обновляем переключатель языка
    updateLanguageSwitcher();
}

// Обновить переключатель языка
function updateLanguageSwitcher() {
    const lang = getCurrentLanguage();
    const switcher = document.getElementById('lang-switcher');
    if (switcher) {
        switcher.textContent = lang.toUpperCase();
    }
}

// Переключить язык
function toggleLanguage() {
    const currentLang = getCurrentLanguage();
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updatePageLanguage();
});
