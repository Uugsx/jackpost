import { describe, it, expect } from '@jest/globals';
import { jackpostToOpenCollection } from '../../src/opencollection/jackpost-to-opencollection';
import { openCollectionToJackpost } from '../../src/opencollection/opencollection-to-jackpost';

describe('openCollectionToJackpost (import): client certificates', () => {
  it('maps pem/pkcs12 certificates to jackpost cert/pfx types', () => {
    const { jackpostConfig } = openCollectionToJackpost({
      opencollection: '1.0.0',
      info: { name: 'API' },
      config: {
        clientCertificates: [
          {
            domain: 'localhost',
            type: 'pem',
            certificateFilePath: './certs/client-cert.pem',
            privateKeyFilePath: './certs/client-key.pem',
            passphrase: 'secret'
          },
          {
            domain: 'example.com',
            type: 'pkcs12',
            pkcs12FilePath: './certs/client.pfx'
          }
        ]
      }
    });

    expect(jackpostConfig.clientCertificates.certs).toEqual([
      {
        domain: 'localhost',
        type: 'cert',
        certFilePath: './certs/client-cert.pem',
        keyFilePath: './certs/client-key.pem',
        passphrase: 'secret'
      },
      {
        domain: 'example.com',
        type: 'pfx',
        pfxFilePath: './certs/client.pfx',
        passphrase: ''
      }
    ]);
  });

  it('reads a per-cert disabled flag when set to true', () => {
    const { jackpostConfig } = openCollectionToJackpost({
      opencollection: '1.0.0',
      info: { name: 'API' },
      config: {
        clientCertificates: [
          {
            domain: 'localhost',
            type: 'pem',
            certificateFilePath: './certs/client-cert.pem',
            privateKeyFilePath: './certs/client-key.pem',
            disabled: true
          },
          {
            domain: 'example.com',
            type: 'pkcs12',
            pkcs12FilePath: './certs/client.pfx'
          }
        ]
      }
    });

    expect(jackpostConfig.clientCertificates.certs[0].disabled).toBe(true);
    expect(jackpostConfig.clientCertificates.certs[1]).not.toHaveProperty('disabled');
  });
});

describe('jackpostToOpenCollection (export): client certificates', () => {
  it('maps jackpost cert/pfx certificates to pem/pkcs12 types', () => {
    const oc = jackpostToOpenCollection({
      name: 'API',
      jackpostConfig: {
        clientCertificates: {
          certs: [
            {
              domain: 'localhost',
              type: 'cert',
              certFilePath: './certs/client-cert.pem',
              keyFilePath: './certs/client-key.pem',
              passphrase: 'secret'
            },
            {
              domain: 'example.com',
              type: 'pfx',
              pfxFilePath: './certs/client.pfx',
              passphrase: ''
            }
          ]
        }
      },
      items: []
    });

    expect(oc.config.clientCertificates).toEqual([
      {
        domain: 'localhost',
        type: 'pem',
        certificateFilePath: './certs/client-cert.pem',
        privateKeyFilePath: './certs/client-key.pem',
        passphrase: 'secret'
      },
      {
        domain: 'example.com',
        type: 'pkcs12',
        pkcs12FilePath: './certs/client.pfx'
      }
    ]);
  });

  it('writes disabled: true only for disabled certs and omits it otherwise', () => {
    const oc = jackpostToOpenCollection({
      name: 'API',
      jackpostConfig: {
        clientCertificates: {
          certs: [
            {
              domain: 'localhost',
              type: 'cert',
              certFilePath: './certs/client-cert.pem',
              keyFilePath: './certs/client-key.pem',
              disabled: true
            },
            {
              domain: 'example.com',
              type: 'pfx',
              pfxFilePath: './certs/client.pfx'
            }
          ]
        }
      },
      items: []
    });

    expect(oc.config.clientCertificates[0].disabled).toBe(true);
    expect(oc.config.clientCertificates[1]).not.toHaveProperty('disabled');
  });
});

describe('client certificates: round-trip', () => {
  it('export then import keeps every certificate field, including the disabled flag', () => {
    const certs = [
      {
        domain: 'localhost',
        type: 'cert',
        certFilePath: './certs/client-cert.pem',
        keyFilePath: './certs/client-key.pem',
        passphrase: 'secret',
        disabled: true
      },
      {
        domain: 'example.com',
        type: 'pfx',
        pfxFilePath: './certs/client.pfx',
        passphrase: 'pfx-secret'
      }
    ];

    const oc = jackpostToOpenCollection({
      name: 'API',
      jackpostConfig: { clientCertificates: { certs } },
      items: []
    });

    const { jackpostConfig } = openCollectionToJackpost(oc);

    expect(jackpostConfig.clientCertificates.certs).toEqual(certs);
  });

  it('import then export keeps every certificate field, including the disabled flag', () => {
    const clientCertificates = [
      {
        domain: 'localhost',
        type: 'pem',
        certificateFilePath: './certs/client-cert.pem',
        privateKeyFilePath: './certs/client-key.pem',
        passphrase: 'secret',
        disabled: true
      },
      {
        domain: 'example.com',
        type: 'pkcs12',
        pkcs12FilePath: './certs/client.pfx',
        passphrase: 'pfx-secret'
      }
    ];

    const jackpost = openCollectionToJackpost({
      opencollection: '1.0.0',
      info: { name: 'API' },
      config: { clientCertificates }
    });

    const oc = jackpostToOpenCollection(jackpost);

    expect(oc.config.clientCertificates).toEqual(clientCertificates);
  });
});
