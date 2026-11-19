# Jackpost Filestore

A generic file storage and parsing package for Jackpost API client.

## Purpose

This package abstracts the file format operations for Jackpost, providing a clean interface for parsing and stringifying Jackpost requests, collections, folders, and environments.

## Features

- Format-agnostic APIs for file operations
- Currently supports Jackpost's custom `.jp` format
- Designed for future extensibility to support YAML and other formats

## Usage

```javascript
const {
  parseRequest,
  stringifyRequest,
  parseCollection,
  stringifyCollection,
  parseEnvironment,
  stringifyEnvironment,
  parseDotEnv
} = require('@jackpost/filestore');

// Parse a .jp request file
const requestData = parseRequest(jpContent);

// Stringify request data to .jp format
const jpContent = stringifyRequest(requestData);

// Example with future format support (not yet implemented)
const requestData = parseRequest(yamlContent, { format: 'yaml' });
```

## API

The package provides the following functions:

- `parseRequest(content, options = { format: 'jp' })`: Parse request file content
- `stringifyRequest(requestObj, options = { format: 'jp' })`: Convert request object to file content
- `parseCollection(content, options = { format: 'jp' })`: Parse collection file content
- `stringifyCollection(collectionObj, options = { format: 'jp' })`: Convert collection object to file content
- `parseFolder(content, options = { format: 'jp' })`: Parse folder file content
- `stringifyFolder(folderObj, options = { format: 'jp' })`: Convert folder object to file content
- `parseEnvironment(content, options = { format: 'jp' })`: Parse environment file content
- `stringifyEnvironment(envObj, options = { format: 'jp' })`: Convert environment object to file content
- `parseDotEnv(content)`: Parse .env file content
