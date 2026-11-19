# Jackpost

Гибрид SoapUI и Postman: клиент для REST, GraphQL, gRPC, WebSocket и SOAP/WSDL.

Коллекции хранятся обычными файлами (`.yml` / `.jp`) в папке на диске и версионируются через Git. Работает офлайн.

## Запуск из исходников

```bash
nvm use && npm i --legacy-peer-deps && npm run setup
npm run dev
```

## Сборка (macOS)

```bash
npm run build:electron
```

## Лицензия

MIT, см. [license.md](license.md).
