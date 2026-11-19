<h1 align="center">Jackpost</h1>

<p align="center">
  Гибрид SoapUI и Postman: десктопный клиент для REST, GraphQL, gRPC, WebSocket и SOAP/WSDL.<br>
  Коллекции — обычные файлы на диске, версионируются через Git. Работает офлайн.
</p>

<p align="center">
  <a href="license.md"><img alt="MIT" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
  <img alt="Platforms" src="https://img.shields.io/badge/macOS%20%C2%B7%20Windows%20%C2%B7%20Linux-lightgrey">
  <img alt="Electron" src="https://img.shields.io/badge/Electron-React-47848f">
</p>

## Возможности

- **REST, GraphQL, gRPC, WebSocket** — запросы, заголовки, параметры, тела, авторизация (Basic, Bearer, OAuth 2.0, AWS SigV4 и др.).
- **SOAP / WSDL** — импорт WSDL, готовые конверты запросов с плейсхолдерами `?`, выбор эндпоинта сервиса.
- **Импорт** — Postman, Insomnia, OpenAPI, WSDL.
- **Окружения и переменные** — на уровне коллекции, папки и запроса, с наследованием.
- **Скрипты и тесты** — pre/post-скрипты, assertions, песочница QuickJS.
- **Файлы, а не облако** — форматы `.yml` (OpenCollection) и `.jp`; удобно ревьюить и хранить в Git.
- **CLI `jp`** — запуск коллекций в CI.

## Запуск из исходников

Node.js v24 (см. `.nvmrc`).

```bash
nvm use && npm i --legacy-peer-deps && npm run setup
npm run dev
```

## Сборка (macOS)

```bash
npm run build:web
npm run build:electron
```

## Структура

| Пакет | Назначение |
|---|---|
| `packages/jackpost-app` | интерфейс (React + Redux) |
| `packages/jackpost-electron` | основной процесс Electron |
| `packages/jackpost-cli` | консольный раннер `jp` |
| `packages/jackpost-converters` | импорт/экспорт: Postman, Insomnia, OpenAPI, WSDL |
| `packages/jackpost-filestore`, `jackpost-lang` | форматы `.yml` / `.jp` |

## Лицензия

MIT, см. [license.md](license.md).
