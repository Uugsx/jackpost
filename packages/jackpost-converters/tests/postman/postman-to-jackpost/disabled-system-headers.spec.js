import { describe, it, expect } from '@jest/globals';
import postmanToJackpost from '../../../src/postman/postman-to-jackpost';

describe('disabled system headers import', () => {
  it('should import disabled system headers from protocolProfileBehavior', async () => {
    const collection = {
      info: {
        name: 'Test Collection',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [
        {
          name: 'Test Request',
          request: {
            method: 'POST',
            url: 'https://api.example.com/test',
            header: [
              {
                key: 'Authorization',
                value: 'Bearer token',
                disabled: false
              }
            ]
          },
          protocolProfileBehavior: {
            disabledSystemHeaders: {
              'accept': true,
              'user-agent': true
            }
          }
        }
      ]
    };

    const { collection: jackpostCollection } = await postmanToJackpost(collection);
    const request = jackpostCollection.items[0];

    expect(request.request.headers).toHaveLength(1);
    expect(request.request.headers[0]).toEqual(expect.objectContaining({
      name: 'Authorization',
      value: 'Bearer token',
      enabled: true
    }));

    expect(request.settings).toBeDefined();
    expect(request.settings.omitHeaders).toEqual(['accept', 'user-agent']);
  });

  it('should handle empty disabledSystemHeaders object', async () => {
    const collection = {
      info: {
        name: 'Test Collection',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [
        {
          name: 'Test Request',
          request: {
            method: 'GET',
            url: 'https://api.example.com/test',
            header: []
          },
          protocolProfileBehavior: {
            disabledSystemHeaders: {}
          }
        }
      ]
    };

    const { collection: jackpostCollection } = await postmanToJackpost(collection);
    const headers = jackpostCollection.items[0].request.headers;

    expect(headers).toHaveLength(0);
  });

  it('should handle null disabledSystemHeaders', async () => {
    const collection = {
      info: {
        name: 'Test Collection',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [
        {
          name: 'Test Request',
          request: {
            method: 'GET',
            url: 'https://api.example.com/test',
            header: [
              {
                key: 'Custom-Header',
                value: 'custom-value'
              }
            ]
          },
          protocolProfileBehavior: {
            disabledSystemHeaders: null
          }
        }
      ]
    };

    const { collection: jackpostCollection } = await postmanToJackpost(collection);
    const headers = jackpostCollection.items[0].request.headers;

    expect(headers).toHaveLength(1);
    expect(headers[0].name).toBe('Custom-Header');
  });

  it('should handle requests with no protocolProfileBehavior', async () => {
    const collection = {
      info: {
        name: 'Test Collection',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [
        {
          name: 'Test Request',
          request: {
            method: 'GET',
            url: 'https://api.example.com/test',
            header: [
              {
                key: 'X-Custom',
                value: 'test'
              }
            ]
          }
        }
      ]
    };

    const { collection: jackpostCollection } = await postmanToJackpost(collection);
    const headers = jackpostCollection.items[0].request.headers;

    expect(headers).toHaveLength(1);
    expect(headers[0].name).toBe('X-Custom');
  });
});
