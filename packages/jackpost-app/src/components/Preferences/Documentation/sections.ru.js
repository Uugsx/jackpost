// Каждый раздел: заголовок и блоки. Блок — { text } | { list: [] } | { code }
export const DOCUMENTATION_SECTIONS_RU = [
  {
    id: 'quick-start',
    title: 'Быстрый старт',
    blocks: [
      { text: 'Jackpost — клиент для SOAP и REST запросов. Все данные хранятся в обычных файлах на вашем диске, их можно держать в Git.' },
      {
        list: [
          'Создайте коллекцию: «Create Collection» в боковой панели или импортируйте готовую.',
          'Добавьте запрос: выберите метод, введите URL, при необходимости заполните заголовки, параметры и тело.',
          'Нажмите «Send» (Ctrl/Cmd+Enter), ответ появится справа.',
          'Сохраните запрос (Ctrl/Cmd+S), чтобы он остался в коллекции.'
        ]
      }
    ]
  },
  {
    id: 'import',
    title: 'Импорт',
    blocks: [
      { text: 'Import Collection принимает файл, Git-репозиторий или URL. Формат определяется по содержимому.' },
      {
        list: [
          'Проект SoapUI (*-soapui-project.xml): интерфейсы, сохранённые вызовы, REST-сервисы, запросы из тест-кейсов и свойства проекта (становятся переменными коллекции). Assertions, Groovy-скрипты и mock-сервисы SoapUI не переносятся.',
          'WSDL (файл или URL с ?wsdl): создаётся папка на сервис и операцию, в каждой — готовый SOAP-конверт с примером тела.',
          'Postman, Insomnia, OpenAPI / Swagger, OpenCollection и собственный формат Jackpost.'
        ]
      },
      { text: 'Файлы workspace и settings SoapUI (default-soapui-workspace.xml, soapui-settings.xml) не являются проектами — импортируйте сами *-soapui-project.xml.' }
    ]
  },
  {
    id: 'soap',
    title: 'SOAP-запросы',
    blocks: [
      { text: 'SOAP-запрос — это POST с XML-телом. При импорте Jackpost сам выставляет нужные заголовки.' },
      {
        list: [
          'Content-Type: text/xml; charset=utf-8 для SOAP 1.1 и application/soap+xml для SOAP 1.2.',
          'SOAPAction: значение берётся из WSDL или проекта SoapUI, его можно изменить во вкладке Headers.',
          'Тело: вкладка Body, режим XML. Знаки «?» в импортированном конверте нужно заменить реальными значениями.',
          'Адрес сервиса: если в WSDL несколько адресов, переключайтесь между ними в выборе эндпоинта запроса.'
        ]
      }
    ]
  },
  {
    id: 'variables',
    title: 'Переменные и окружения',
    blocks: [
      { text: 'Переменная подставляется в URL, заголовки, параметры и тело записью двойных фигурных скобок.' },
      { code: 'https://{{host}}/services/{{service}}' },
      {
        list: [
          'Окружения (Environments) — наборы переменных, например test и prod. Переключатель находится в правом верхнем углу коллекции.',
          'Переменные коллекции, папки и запроса задаются на соответствующем уровне и действуют внутри него.',
          'Секреты (ключи, пароли) помечайте как secret — они не попадают в файлы коллекции.'
        ]
      }
    ]
  },
  {
    id: 'scripts',
    title: 'Скрипты и тесты',
    blocks: [
      { text: 'Во вкладках Script и Tests доступен JavaScript. Объект jp даёт доступ к переменным, res — к ответу.' },
      {
        code: `// Post Response
jp.setEnvVar('token', res.getBody().token);

// Tests
test('статус 200', function () {
  expect(res.getStatus()).to.equal(200);
});`
      },
      {
        list: [
          'jp.setVar / jp.getVar — временные переменные запуска.',
          'jp.setEnvVar / jp.getEnvVar — переменные окружения.',
          'jp.setNextRequest — управление порядком в раннере коллекции.',
          'res.getStatus(), res.getBody(), res.setBody() — данные ответа.'
        ]
      }
    ]
  },
  {
    id: 'cli',
    title: 'CLI (jp)',
    blocks: [
      { text: 'Консольная версия запускает и импортирует коллекции без интерфейса, например в CI.' },
      {
        code: `jp run папка/запроса -r --env test
jp run -r --env-file prod.json --reporter-html отчёт.html
jp import soapui -s проект-soapui-project.xml -o ~/Desktop
jp import wsdl -s https://example.com/service?wsdl -o ~/Desktop`
      },
      {
        list: [
          '-r — рекурсивный запуск вложенных папок.',
          '--env, --env-file, --env-var key=value — окружение и переопределение переменных.',
          '--reporter-json, --reporter-junit, --reporter-html — отчёты.',
          '--insecure — не проверять TLS-сертификаты (только для тестовых стендов).',
          'Типы импорта: openapi, wsdl, soapui, postman. Справка: jp --help.'
        ]
      }
    ]
  },
  {
    id: 'updates',
    title: 'Обновления',
    blocks: [
      { text: 'Меню «Check for Updates…» проверяет последнюю версию. Если она новее установленной, Jackpost предложит установить её: приложение скачивает образ, проверяет контрольную сумму, заменяет себя и перезапускается. Данные и настройки сохраняются.' },
      { text: 'Portable-версия для Windows (*_win_portable.exe) не устанавливает обновления сама: она открывает страницу релиза, новый exe скачайте оттуда.' }
    ]
  }
];
