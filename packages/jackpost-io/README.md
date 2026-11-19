# Jackpost IO

Writes a converted collection to disk.

## Usage

```javascript
const { openApiToJackpost } = require('@jackpost/converters');
const { writeCollection } = require('@jackpost/io');

const main = async () => {
  const collection = openApiToJackpost(openApiSpecification);
  await writeCollection(collection, './my-collection');
};

main();
```

`outputDir` is created if it does not exist. If it already exists it must be empty, otherwise the call rejects with an error whose `code` is `'ENOTEMPTY'` and nothing is written.

## API

- `writeCollection(collection, outputDir)`: Write a whole collection to `outputDir` in `yml` format. Resolves to `outputDir`. `outputDir` must be missing or empty; otherwise it rejects with `code: 'ENOTEMPTY'`

## Building

The build and the tests resolve `@jackpost/filestore` from its `dist`, so build filestore first:

```bash
npm run build:jackpost-filestore
npm run build:jackpost-io
```
