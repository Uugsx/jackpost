# jackpost-converters

The converters package is responsible for converting collections from one format to a Jackpost collection.
It can be used as a standalone package or as a part of the Jackpost framework.

## Installation

```bash
npm install @jackpost/converters
```

## Usage

### Convert Postman collection to Jackpost collection

```javascript
const { postmanToJackpost } = require('@jackpost/converters');

// Convert Postman collection to Jackpost collection
const jackpostCollection = postmanToJackpost(postmanCollection);
```

### Convert Postman Environment to Jackpost Environment

```javascript
const { postmanToJackpostEnvironment } = require('@jackpost/converters');

const jackpostEnvironment = postmanToJackpostEnvironment(postmanEnvironment);
```

### Convert Insomnia collection to Jackpost collection

```javascript
const { insomniaToJackpost } = require('@jackpost/converters');

const jackpostCollection = insomniaToJackpost(insomniaCollection);
```

### Convert OpenAPI specification to Jackpost collection

```javascript
const { openApiToJackpost } = require('@jackpost/converters');

const jackpostCollection = openApiToJackpost(openApiSpecification);
```

### Convert WSDL file to Jackpost collection

```javascript
import { wsdlToJackpost } from '@jackpost/converters';

const jackpostCollection = await wsdlToJackpost(wsdlContent);
```

## Example 

```javascript

const { postmanToJackpost } = require('@jackpost/converters');
const { writeCollection } = require('@jackpost/io');
const fs = require('fs/promises');

async function convertPostmanToJackpost(inputFile, outputDir) {
  const inputData = await fs.readFile(inputFile, 'utf8');

  const collection = await postmanToJackpost(JSON.parse(inputData));
  // Writes YAML (OpenCollection) files.
  await writeCollection(collection, outputDir);
}

convertPostmanToJackpost('demo_collection.postman_collection.json', './jackpost-collection');

``` 

## WSDL Import Features

The WSDL importer supports the following features:

- **Service Discovery**: Automatically extracts service endpoints from WSDL definitions
- **Operation Mapping**: Converts WSDL operations to Jackpost HTTP requests
- **SOAP Envelope Generation**: Creates proper SOAP envelopes for each operation
- **Header Configuration**: Sets up appropriate Content-Type and SOAPAction headers
- **Environment Variables**: Creates environment variables for service base URLs
- **Folder Organization**: Groups operations by port type for better organization

### WSDL Import Example

```javascript
import { wsdlToJackpost } from '@jackpost/converters';
import { writeCollection } from '@jackpost/io';
import fs from 'fs/promises';

async function importWSDL() {
  const wsdlContent = await fs.readFile('service.wsdl', 'utf8');

  const collection = await wsdlToJackpost(wsdlContent);
  // Writes YAML (OpenCollection) files.
  await writeCollection(collection, './soap-collection');
}

importWSDL();
```

### CLI Usage

You can also use the Jackpost CLI to import WSDL files:

```bash
# Import WSDL file to a directory
jackpost import wsdl --source service.wsdl --output ~/Desktop/soap-collection --collection-name "SOAP Service"

# Import WSDL from URL
jackpost import wsdl --source https://example.com/service.wsdl --output ~/Desktop --collection-name "Remote SOAP Service"

# Import WSDL and save as JSON file
jackpost import wsdl --source service.wsdl --output-file ~/Desktop/soap-collection.json --collection-name "SOAP Service"
```

## Supported Formats

- **Postman Collections** (v2.1)
- **Insomnia Collections** (v4 and v5)
- **OpenAPI Specifications** (v3.0)
- **WSDL Files** (Web Services Description Language)

## Dependencies

- `lodash` - Utility functions
- `nanoid` - UUID generation
- `js-yaml` - YAML parsing
- `xml2js` - XML parsing for WSDL
- `@jackpost/schema` - Schema validation
