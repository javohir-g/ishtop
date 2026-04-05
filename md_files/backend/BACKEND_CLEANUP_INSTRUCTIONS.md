# 📁 Инструкции по очистке и организации документации

## ✅ Что сделано:

1. ✅ Создана папка `/backend-docs/`
2. ✅ Создан гайд по организации (`0_ORGANIZATION_GUIDE.md`)
3. ✅ Скопирован главный README (`1_README_BACKEND.md`)

---

## 📝 Что нужно сделать вручную:

### Шаг 1: Переместить backend файлы

Переместите следующие файлы из корня `/` в `/backend-docs/` с новыми именами:

```bash
# Команды для перемещения (выполнить в терминале):

mv /BACKEND_DOCS_INDEX.md /backend-docs/2_BACKEND_DOCS_INDEX.md
mv /QUICK_START_BACKEND.md /backend-docs/3_QUICK_START_BACKEND.md
mv /BACKEND_DATABASE_GUIDE.md /backend-docs/4_BACKEND_DATABASE_GUIDE.md
mv /FRONTEND_BACKEND_INTEGRATION.md /backend-docs/5_FRONTEND_BACKEND_INTEGRATION.md
mv /DATABASE_SCHEMA_VISUAL.md /backend-docs/6_DATABASE_SCHEMA_VISUAL.md
mv /BACKEND_CHEATSHEET.md /backend-docs/7_BACKEND_CHEATSHEET.md
mv /DATABASE_IMPLEMENTATION_PROMPT.md /backend-docs/8_DATABASE_IMPLEMENTATION_PROMPT.md
mv /BACKEND_SPECIFICATION.md /backend-docs/9_BACKEND_SPECIFICATION.md
mv /BACKEND_INTEGRATION_GUIDE.md /backend-docs/10_BACKEND_INTEGRATION_GUIDE.md
mv /QUICK_BACKEND_INTEGRATION.md /backend-docs/11_QUICK_BACKEND_INTEGRATION.md
mv /DOCUMENTATION_SUMMARY.md /backend-docs/12_DOCUMENTATION_SUMMARY.md
mv /BACKEND_CLARIFICATION_QUESTIONS.md /backend-docs/13_BACKEND_CLARIFICATION_QUESTIONS.md
mv /DEVELOPER_HANDOFF.md /backend-docs/14_DEVELOPER_HANDOFF.md
```

**Или через Git:**
```bash
git mv README_BACKEND.md backend-docs/1_README_BACKEND.md
git mv BACKEND_DOCS_INDEX.md backend-docs/2_BACKEND_DOCS_INDEX.md
git mv QUICK_START_BACKEND.md backend-docs/3_QUICK_START_BACKEND.md
git mv BACKEND_DATABASE_GUIDE.md backend-docs/4_BACKEND_DATABASE_GUIDE.md
git mv FRONTEND_BACKEND_INTEGRATION.md backend-docs/5_FRONTEND_BACKEND_INTEGRATION.md
git mv DATABASE_SCHEMA_VISUAL.md backend-docs/6_DATABASE_SCHEMA_VISUAL.md
git mv BACKEND_CHEATSHEET.md backend-docs/7_BACKEND_CHEATSHEET.md
git mv DATABASE_IMPLEMENTATION_PROMPT.md backend-docs/8_DATABASE_IMPLEMENTATION_PROMPT.md
git mv BACKEND_SPECIFICATION.md backend-docs/9_BACKEND_SPECIFICATION.md
git mv BACKEND_INTEGRATION_GUIDE.md backend-docs/10_BACKEND_INTEGRATION_GUIDE.md
git mv QUICK_BACKEND_INTEGRATION.md backend-docs/11_QUICK_BACKEND_INTEGRATION.md
git mv DOCUMENTATION_SUMMARY.md backend-docs/12_DOCUMENTATION_SUMMARY.md
git mv BACKEND_CLARIFICATION_QUESTIONS.md backend-docs/13_BACKEND_CLARIFICATION_QUESTIONS.md
git mv DEVELOPER_HANDOFF.md backend-docs/14_DEVELOPER_HANDOFF.md
```

---

### Шаг 2: Удалить frontend файлы

Удалите следующие файлы из корня `/` (они относятся к frontend):

```bash
rm /ATTRIBUTIONS.md
rm /AUTH_PAGES_SUMMARY.md
rm /IMPLEMENTATION_SUMMARY.md
rm /MOCK_DATA_REFACTORING_SUMMARY.md
rm /RESPONSIVE_DESIGN_SUMMARY.md
rm /SAFE_AREA_LAYOUT_DIAGRAM.md
rm /SAFE_AREA_QUICK_REFERENCE.md
rm /SAFE_AREA_README.md
rm /SAFE_AREA_VISUAL_SUMMARY.md
rm /TELEGRAM_SAFE_AREA_GUIDE.md
rm /UPDATES_SUMMARY.md
rm /WORKERS_PAGE_SUMMARY.md
```

**Или через Git:**
```bash
git rm ATTRIBUTIONS.md
git rm AUTH_PAGES_SUMMARY.md
git rm IMPLEMENTATION_SUMMARY.md
git rm MOCK_DATA_REFACTORING_SUMMARY.md
git rm RESPONSIVE_DESIGN_SUMMARY.md
git rm SAFE_AREA_LAYOUT_DIAGRAM.md
git rm SAFE_AREA_QUICK_REFERENCE.md
git rm SAFE_AREA_README.md
git rm SAFE_AREA_VISUAL_SUMMARY.md
git rm TELEGRAM_SAFE_AREA_GUIDE.md
git rm UPDATES_SUMMARY.md
git rm WORKERS_PAGE_SUMMARY.md
```

---

### Шаг 3: Обновить ссылки (опционально)

Если в документах есть ссылки на другие файлы, обновите их:

**Было:**
```markdown
[BACKEND_DATABASE_GUIDE.md](/BACKEND_DATABASE_GUIDE.md)
```

**Стало:**
```markdown
[BACKEND_DATABASE_GUIDE.md](4_BACKEND_DATABASE_GUIDE.md)
```

---

## 📂 Итоговая структура проекта

После выполнения всех шагов структура будет следующей:

```
/
├── backend-docs/                              ← Backend документация
│   ├── 0_ORGANIZATION_GUIDE.md
│   ├── 1_README_BACKEND.md                    ← Главный README
│   ├── 2_BACKEND_DOCS_INDEX.md
│   ├── 3_QUICK_START_BACKEND.md
│   ├── 4_BACKEND_DATABASE_GUIDE.md            ← ⭐ Главный гайд
│   ├── 5_FRONTEND_BACKEND_INTEGRATION.md
│   ├── 6_DATABASE_SCHEMA_VISUAL.md
│   ├── 7_BACKEND_CHEATSHEET.md
│   ├── 8_DATABASE_IMPLEMENTATION_PROMPT.md
│   ├── 9_BACKEND_SPECIFICATION.md
│   ├── 10_BACKEND_INTEGRATION_GUIDE.md
│   ├── 11_QUICK_BACKEND_INTEGRATION.md
│   ├── 12_DOCUMENTATION_SUMMARY.md
│   ├── 13_BACKEND_CLARIFICATION_QUESTIONS.md
│   └── 14_DEVELOPER_HANDOFF.md
│
├── guidelines/                                ← Оставить как есть
├── src/                                       ← Фронтенд (не трогать)
├── index.html
├── package.json
└── vite.config.ts
```

---

## ✅ Проверка

После выполнения всех шагов убедитесь:

- [ ] Все backend файлы в `/backend-docs/`
- [ ] Frontend MD файлы удалены из корня
- [ ] Проект чистый и организованный
- [ ] Начать можно с `/backend-docs/1_README_BACKEND.md`

---

## 🚀 Начало работы

После очистки откройте:

1. **/backend-docs/1_README_BACKEND.md** - обзор
2. **/backend-docs/3_QUICK_START_BACKEND.md** - быстрый старт
3. **/backend-docs/4_BACKEND_DATABASE_GUIDE.md** - полный гайд

---

**Создано:** 14 марта 2026  
**Статус:** Готово к выполнению
