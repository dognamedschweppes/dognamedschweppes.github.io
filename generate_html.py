import os
import re

def generate_pages(start=1, end=70, template_file='template.html', output_dir='.'):
    # Читаем шаблон
    with open(template_file, 'r', encoding='utf-8') as f:
        template = f.read()

    # Убедимся, что папка существует
    os.makedirs(output_dir, exist_ok=True)

    for n in range(start, end + 1):
        # Формируем номер с ведущими нулями (5 цифр)
        num_str = f"{n:05d}"
        prev_num = f"{n-1:05d}" if n > start else num_str   # для n=1 ссылка "назад" ведёт на себя или можно убрать
        next_num = f"{n+1:05d}" if n < end else num_str     # для последней ссылка "вперед" на себя

        # Заменяем все вхождения в шаблоне
        content = template
        # Заменяем номера в data-i18n (ключи)
        content = content.replace('page_XXXXX_title', f'page_{num_str}_title')
        content = content.replace('page_XXXXX_text', f'page_{num_str}_text')
        content = content.replace('page_XXXXX_link', f'page_{num_str}_link')
        # Заменяем номер картинки
        content = content.replace('data-i18n-img="XXXXX"', f'data-i18n-img="{num_str}"')
        # Заменяем ссылки "вперед" и "назад"
        # В шаблоне мы заменим href="XXXXX" на href="NEXT" и "PREV"
        content = content.replace('href="PREV"', f'href="{prev_num}"')
        content = content.replace('href="NEXT"', f'href="{next_num}"')
        # Также нужно заменить в data-i18n для страницы (если есть явные тексты) – но они через i18n, так что не надо.

        # Сохраняем файл
        output_file = os.path.join(output_dir, f'{num_str}.html')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Generated {output_file}')

if __name__ == '__main__':
    # Настрой параметры
    generate_pages(start=1, end=70, template_file='template.html', output_dir='.')