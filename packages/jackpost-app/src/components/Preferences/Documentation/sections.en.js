// Each section: a title and blocks. A block is { text } | { list: [] } | { code }
export const DOCUMENTATION_SECTIONS_EN = [
  {
    id: 'quick-start',
    title: 'Quick start',
    blocks: [
      { text: 'Jackpost is a client for SOAP and REST requests. Everything is stored as plain files on your disk, so collections can live in Git.' },
      {
        list: [
          'Create a collection: «Create Collection» in the sidebar, or import an existing one.',
          'Add a request: pick the method, enter the URL, fill in headers, params and body as needed.',
          'Press «Send» (Ctrl/Cmd+Enter); the response appears on the right.',
          'Save the request (Ctrl/Cmd+S) to keep it in the collection.'
        ]
      }
    ]
  },
  {
    id: 'import',
    title: 'Import',
    blocks: [
      { text: 'Import Collection accepts a file, a Git repository or a URL. The format is detected from the content.' },
      {
        list: [
          'SoapUI project (*-soapui-project.xml): interfaces, saved calls, REST services, requests from test cases and project properties (they become collection variables). SoapUI assertions, Groovy scripts and mock services are not imported.',
          'WSDL (a file or a URL with ?wsdl): a folder per service and operation, each with a ready SOAP envelope and a sample body.',
          'Postman, Insomnia, OpenAPI / Swagger, OpenCollection and the native Jackpost format.'
        ]
      },
      { text: 'SoapUI workspace and settings files (default-soapui-workspace.xml, soapui-settings.xml) are not projects — import the *-soapui-project.xml files themselves.' }
    ]
  },
  {
    id: 'soap',
    title: 'SOAP requests',
    blocks: [
      { text: 'A SOAP request is a POST with an XML body. On import Jackpost sets the required headers for you.' },
      {
        list: [
          'Content-Type: text/xml; charset=utf-8 for SOAP 1.1 and application/soap+xml for SOAP 1.2.',
          'SOAPAction: taken from the WSDL or the SoapUI project; change it in the Headers tab.',
          'Body: the Body tab in XML mode. Replace the «?» placeholders of an imported envelope with real values.',
          'Service address: if the WSDL declares several addresses, switch between them in the request endpoint picker.'
        ]
      }
    ]
  },
  {
    id: 'variables',
    title: 'Variables and environments',
    blocks: [
      { text: 'A variable is substituted into the URL, headers, params and body with double curly braces.' },
      { code: 'https://{{host}}/services/{{service}}' },
      {
        list: [
          'Environments are sets of variables, for example test and prod. The switcher is in the top right corner of a collection.',
          'Collection, folder and request variables are set at their level and apply inside it.',
          'Mark keys and passwords as secret so they are not written to the collection files.'
        ]
      }
    ]
  },
  {
    id: 'scripts',
    title: 'Scripts and tests',
    blocks: [
      { text: 'The Script and Tests tabs run JavaScript. The jp object gives access to variables, res to the response.' },
      {
        code: `// Post Response
jp.setEnvVar('token', res.getBody().token);

// Tests
test('status is 200', function () {
  expect(res.getStatus()).to.equal(200);
});`
      },
      {
        list: [
          'jp.setVar / jp.getVar — runtime variables.',
          'jp.setEnvVar / jp.getEnvVar — environment variables.',
          'jp.setNextRequest — controls the order in the collection runner.',
          'res.getStatus(), res.getBody(), res.setBody() — response data.'
        ]
      }
    ]
  },
  {
    id: 'cli',
    title: 'CLI (jp)',
    blocks: [
      { text: 'The command-line version runs and imports collections without the UI, for example in CI.' },
      {
        code: `jp run requests/folder -r --env test
jp run -r --env-file prod.json --reporter-html report.html
jp import soapui -s project-soapui-project.xml -o ~/Desktop
jp import wsdl -s https://example.com/service?wsdl -o ~/Desktop`
      },
      {
        list: [
          '-r — run nested folders recursively.',
          '--env, --env-file, --env-var key=value — environment and variable overrides.',
          '--reporter-json, --reporter-junit, --reporter-html — reports.',
          '--insecure — skip TLS certificate checks (test servers only).',
          'Import types: openapi, wsdl, soapui, postman. Help: jp --help.'
        ]
      }
    ]
  },
  {
    id: 'updates',
    title: 'Updates',
    blocks: [
      { text: 'The «Check for Updates…» menu item looks for the latest version. If it is newer than the installed one, Jackpost offers to install it: it downloads the image, verifies its checksum, replaces itself and restarts. Your data and settings are kept.' },
      { text: 'The Windows portable version (*_win_portable.exe) does not install updates itself: it opens the release page, download the new exe from there.' }
    ]
  }
];
