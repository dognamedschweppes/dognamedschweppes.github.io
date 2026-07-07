import re
from pathlib import Path

def parse_panels(filename):
    """Разбирает файл с панелями и возвращает список словарей {num, command, narration, next_command}"""
    text = Path(filename).read_text(encoding='utf-8')
    panels = []
    # Разбиваем по "Panel N" или "Command:" — в твоих файлах используется "Panel N"
    # Но они могут быть с номерами: "Panel 1", "Panel 2"...
    # Я буду искать по шаблону "Panel <число>"
    raw_panels = re.split(r'Panel\s+(\d+)', text)
    # Первый элемент пустой (до первой панели)
    if raw_panels[0].strip() == '':
        raw_panels = raw_panels[1:]
    # Теперь raw_panels имеет вид: [num1, content1, num2, content2, ...]
    for i in range(0, len(raw_panels), 2):
        num = int(raw_panels[i])
        content = raw_panels[i+1].strip()
        # Извлекаем команду (первая строка после "Command:")
        command_match = re.search(r'Command:\s*(.*?)(?:\n|$)', content)
        command = command_match.group(1).strip() if command_match else ''
        # Извлекаем повествование (всё, что после "Narration:" до конца или до следующей команды?)
        # В твоих файлах Narration идёт отдельной строкой, но может быть несколько строк.
        narration_match = re.search(r'Narration:\s*(.*?)(?:\n\s*Command:|$)', content, re.DOTALL)
        narration = narration_match.group(1).strip() if narration_match else ''
        # Извлекаем следующую команду (ссылка) – обычно она идёт после Narration или в конце.
        # Иногда следующая команда является частью текста, но в твоём формате она отдельно.
        # Мы можем взять последнюю строку, если она начинается с "Command:" или "≡>"?
        # Но у тебя в файле ссылка может быть в виде "Command: Егор: ..." в конце панели.
        # Проще: мы можем взять command из следующей панели, но это неудобно.
        # Лучше искать в конце панели строку, начинающуюся с "Command:" или "≡>"
        next_command = ''
        lines = content.split('\n')
        # Идём с конца, ищем строку, которая начинается с "Command:" или "≡>"
        for line in reversed(lines):
            line = line.strip()
            if line.startswith('Command:') or line.startswith('≡>'):
                next_command = line.replace('Command:', '').strip()
                break
        # Если не нашли, оставляем пустым
        panels.append({
            'num': num,
            'command': command,
            'narration': narration,
            'next_command': next_command
        })
    return panels

# Парсим оба файла
ru_panels = parse_panels('dns_ru_text.txt')
en_panels = parse_panels('dns_en_text.txt')

# Проверяем, что номера совпадают
assert len(ru_panels) == len(en_panels)
for r, e in zip(ru_panels, en_panels):
    assert r['num'] == e['num']

# Генерируем строки для i18n.js только для страниц > 9 (так как до 9 уже есть)
output_ru = []
output_en = []
for r, e in zip(ru_panels, en_panels):
    num = r['num']
    if num <= 9:
        continue
    key = f"page_{num:05d}"
    # Заголовок (title) – это команда. Если команда пустая, можно оставить пустую строку.
    title_ru = r['command']
    title_en = e['command']
    # Текст повествования
    text_ru = r['narration']
    text_en = e['narration']
    # Ссылка (next_command)
    link_ru = r['next_command']
    link_en = e['next_command']

    # Добавляем в списки
    output_ru.append(f'        {key}_title: "{title_ru}",')
    output_ru.append(f'        {key}_text: "{text_ru}",')
    if link_ru:
        output_ru.append(f'        {key}_link: "{link_ru}",')
    else:
        output_ru.append(f'        {key}_link: "",')

    output_en.append(f'        {key}_title: "{title_en}",')
    output_en.append(f'        {key}_text: "{text_en}",')
    if link_en:
        output_en.append(f'        {key}_link: "{link_en}",')
    else:
        output_en.append(f'        {key}_link: "",')

# Выводим результат для копирования
print("=== ДЛЯ РУССКОЙ ВЕРСИИ (вставь в раздел ru:) ===")
print('\n'.join(output_ru))
print("\n=== ДЛЯ АНГЛИЙСКОЙ ВЕРСИИ (вставь в раздел en:) ===")
print('\n'.join(output_en))