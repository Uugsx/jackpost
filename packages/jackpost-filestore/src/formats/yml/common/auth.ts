import type {
  Auth,
  AuthApiKey,
  AuthAwsV4,
  AuthBasic,
  AuthBearer,
  AuthDigest,
  AuthNTLM,
  AuthOAuth1,
  AuthWsse
} from '@opencollection/types/common/auth';
import type { Auth as JackpostAuth, AuthOauth1 as JackpostAuthOauth1 } from '@jackpost/schema-types/common/auth';
import { isString } from '../../../utils';
import { toOpenCollectionOAuth2, toJackpostOAuth2 } from './auth-oauth2';

// EdgeGrid is a Jackpost-specific auth mode that is not part of the OpenCollection spec,
// so its shape is defined locally and serialized using the same field names as Jackpost.
interface AkamaiEdgeGridAuthValues {
  type: 'akamai-edgegrid';
  accessToken?: string;
  clientToken?: string;
  clientSecret?: string;
  baseURL?: string | null;
  nonce?: string | null;
  timestamp?: string | null;
  headersToSign?: string | null;
  maxBodySize?: number | null;
}

const buildAwsV4Auth = (config?: JackpostAuth['awsv4']): AuthAwsV4 => {
  const auth: AuthAwsV4 = { type: 'awsv4' };

  if (!config) {
    return auth;
  }

  if (isString(config.accessKeyId)) auth.accessKeyId = config.accessKeyId;
  if (isString(config.secretAccessKey)) auth.secretAccessKey = config.secretAccessKey;
  if (isString(config.sessionToken)) auth.sessionToken = config.sessionToken;
  if (isString(config.service)) auth.service = config.service;
  if (isString(config.region)) auth.region = config.region;
  if (isString(config.profileName)) auth.profileName = config.profileName;

  return auth;
};

const buildBasicAuth = (config?: JackpostAuth['basic']): AuthBasic => {
  const auth: AuthBasic = { type: 'basic' };

  if (!config) {
    return auth;
  }

  if (isString(config.username)) auth.username = config.username;
  if (isString(config.password)) auth.password = config.password;

  return auth;
};

const buildBearerAuth = (config?: JackpostAuth['bearer']): AuthBearer => {
  const auth: AuthBearer = { type: 'bearer' };

  if (!config) {
    return auth;
  }

  if (isString(config.token)) auth.token = config.token;

  return auth;
};

const buildDigestAuth = (config?: JackpostAuth['digest']): AuthDigest => {
  const auth: AuthDigest = { type: 'digest' };

  if (!config) {
    return auth;
  }

  if (isString(config.username)) auth.username = config.username;
  if (isString(config.password)) auth.password = config.password;

  return auth;
};

const buildNtlmAuth = (config?: JackpostAuth['ntlm']): AuthNTLM => {
  const auth: AuthNTLM = { type: 'ntlm' };

  if (!config) {
    return auth;
  }

  if (isString(config.username)) auth.username = config.username;
  if (isString(config.password)) auth.password = config.password;
  if (isString(config.domain)) auth.domain = config.domain;

  return auth;
};

const buildWsseAuth = (config?: JackpostAuth['wsse']): AuthWsse => {
  const auth: AuthWsse = { type: 'wsse' };

  if (!config) {
    return auth;
  }

  if (isString(config.username)) auth.username = config.username;
  if (isString(config.password)) auth.password = config.password;

  return auth;
};

const buildApiKeyAuth = (config?: JackpostAuth['apikey']): AuthApiKey => {
  const auth: AuthApiKey = { type: 'apikey' };

  if (!config) {
    return auth;
  }

  if (isString(config.key)) auth.key = config.key;
  if (isString(config.value)) auth.value = config.value;

  if (isString(config.placement)) {
    if (config.placement === 'header') {
      auth.placement = 'header';
    } else if (config.placement === 'queryparams') {
      auth.placement = 'query';
    }
  }

  return auth;
};

const buildEdgeGridAuth = (config?: JackpostAuth['akamaiEdgegrid']): AkamaiEdgeGridAuthValues => {
  const auth: AkamaiEdgeGridAuthValues = { type: 'akamai-edgegrid' };

  if (!config) {
    return auth;
  }

  if (isString(config.accessToken)) auth.accessToken = config.accessToken;
  if (isString(config.clientToken)) auth.clientToken = config.clientToken;
  if (isString(config.clientSecret)) auth.clientSecret = config.clientSecret;
  if (isString(config.nonce)) auth.nonce = config.nonce;
  if (isString(config.timestamp)) auth.timestamp = config.timestamp;
  if (isString(config.baseURL)) auth.baseURL = config.baseURL;
  if (isString(config.headersToSign)) auth.headersToSign = config.headersToSign;
  if (typeof config.maxBodySize === 'number') auth.maxBodySize = config.maxBodySize;

  return auth;
};

const buildOAuth1Auth = (config?: JackpostAuth['oauth1']): AuthOAuth1 => {
  const auth: AuthOAuth1 = { type: 'oauth1' };

  if (!config) {
    return auth;
  }

  if (isString(config.consumerKey)) auth.consumerKey = config.consumerKey;
  if (isString(config.consumerSecret)) auth.consumerSecret = config.consumerSecret;
  if (isString(config.accessToken)) auth.accessToken = config.accessToken;
  if (isString(config.accessTokenSecret)) auth.accessTokenSecret = config.accessTokenSecret;
  if (isString(config.callbackUrl)) auth.callbackUrl = config.callbackUrl;
  if (isString(config.verifier)) auth.verifier = config.verifier;
  if (isString(config.signatureMethod)) auth.signatureMethod = config.signatureMethod;
  if (isString(config.privateKey)) {
    auth.privateKey = config.privateKeyType === 'file'
      ? { type: 'file' as const, value: config.privateKey }
      : { type: 'text' as const, value: config.privateKey };
  }
  if (isString(config.timestamp)) auth.timestamp = config.timestamp;
  if (isString(config.nonce)) auth.nonce = config.nonce;
  if (isString(config.version)) auth.version = config.version;
  if (isString(config.realm)) auth.realm = config.realm;
  if (isString(config.placement)) auth.placement = config.placement as AuthOAuth1['placement'];
  if (typeof config.includeBodyHash === 'boolean') auth.includeBodyHash = config.includeBodyHash;

  return auth;
};

export const toOpenCollectionAuth = (auth?: JackpostAuth | null): Auth | undefined => {
  if (!auth || auth.mode === 'none') {
    return undefined;
  }

  if (auth.mode === 'inherit') {
    return 'inherit';
  }

  switch (auth.mode) {
    case 'awsv4':
      return buildAwsV4Auth(auth.awsv4);
    case 'basic':
      return buildBasicAuth(auth.basic);
    case 'bearer':
      return buildBearerAuth(auth.bearer);
    case 'digest':
      return buildDigestAuth(auth.digest);
    case 'ntlm':
      return buildNtlmAuth(auth.ntlm);
    case 'wsse':
      return buildWsseAuth(auth.wsse);
    case 'apikey':
      return buildApiKeyAuth(auth.apikey);
    case 'oauth1':
      return buildOAuth1Auth(auth.oauth1);
    case 'oauth2':
      return toOpenCollectionOAuth2(auth.oauth2);
    case 'akamai-edgegrid':
      return buildEdgeGridAuth(auth.akamaiEdgegrid) as unknown as Auth;
    default:
      console.warn(`toOpenCollectionAuth failed: Unsupported auth mode "${auth.mode}".`);
      return undefined;
  }
};

export const toJackpostAuth = (auth: Auth | null | undefined): JackpostAuth | null => {
  const jackpostAuth: JackpostAuth = {
    mode: 'none',
    awsv4: null,
    basic: null,
    bearer: null,
    digest: null,
    ntlm: null,
    oauth2: null,
    wsse: null,
    apikey: null,
    akamaiEdgegrid: null
  };

  if (!auth) {
    return jackpostAuth;
  }

  if (auth === 'inherit') {
    jackpostAuth.mode = 'inherit';
    return jackpostAuth;
  }

  if ((auth as unknown as AkamaiEdgeGridAuthValues).type === 'akamai-edgegrid') {
    const edgegrid = auth as unknown as AkamaiEdgeGridAuthValues;
    jackpostAuth.mode = 'akamai-edgegrid';
    jackpostAuth.akamaiEdgegrid = {
      accessToken: edgegrid.accessToken || '',
      clientToken: edgegrid.clientToken || '',
      clientSecret: edgegrid.clientSecret || '',
      nonce: edgegrid.nonce || '',
      timestamp: edgegrid.timestamp || '',
      baseURL: edgegrid.baseURL || '',
      headersToSign: edgegrid.headersToSign || '',
      maxBodySize: typeof edgegrid.maxBodySize === 'number' ? edgegrid.maxBodySize : null
    };
    return jackpostAuth;
  }

  switch (auth.type) {
    case 'awsv4':
      jackpostAuth.mode = 'awsv4';
      jackpostAuth.awsv4 = {
        accessKeyId: auth.accessKeyId || null,
        secretAccessKey: auth.secretAccessKey || null,
        sessionToken: auth.sessionToken || null,
        service: auth.service || null,
        region: auth.region || null,
        profileName: auth.profileName || null
      };
      break;

    case 'basic':
      jackpostAuth.mode = 'basic';
      jackpostAuth.basic = {
        username: auth.username || null,
        password: auth.password || null
      };
      break;

    case 'bearer':
      jackpostAuth.mode = 'bearer';
      jackpostAuth.bearer = {
        token: auth.token || ''
      };
      break;

    case 'digest':
      jackpostAuth.mode = 'digest';
      jackpostAuth.digest = {
        username: auth.username || null,
        password: auth.password || null
      };
      break;

    case 'ntlm':
      jackpostAuth.mode = 'ntlm';
      jackpostAuth.ntlm = {
        username: auth.username || null,
        password: auth.password || null,
        domain: auth.domain || null
      };
      break;

    case 'wsse':
      jackpostAuth.mode = 'wsse';
      jackpostAuth.wsse = {
        username: auth.username || null,
        password: auth.password || null
      };
      break;

    case 'apikey':
      jackpostAuth.mode = 'apikey';
      jackpostAuth.apikey = {
        key: auth.key || null,
        value: auth.value || null,
        placement: auth.placement === 'query' ? 'queryparams' : (auth.placement === 'header' ? 'header' : null)
      };
      break;

    case 'oauth1':
      jackpostAuth.mode = 'oauth1';
      jackpostAuth.oauth1 = {
        consumerKey: auth.consumerKey || null,
        consumerSecret: auth.consumerSecret || null,
        accessToken: auth.accessToken || null,
        accessTokenSecret: auth.accessTokenSecret || null,
        callbackUrl: auth.callbackUrl || null,
        verifier: auth.verifier || null,
        signatureMethod: (auth.signatureMethod as JackpostAuthOauth1['signatureMethod']) || 'HMAC-SHA1',
        privateKey: (typeof auth.privateKey === 'object' && auth.privateKey ? auth.privateKey.value : auth.privateKey) || null,
        privateKeyType: (typeof auth.privateKey === 'object' && auth.privateKey ? auth.privateKey.type : 'text') as JackpostAuthOauth1['privateKeyType'],
        timestamp: auth.timestamp || null,
        nonce: auth.nonce || null,
        version: auth.version || '1.0',
        realm: auth.realm || null,
        placement: (auth.placement as JackpostAuthOauth1['placement']) || 'header',
        includeBodyHash: auth.includeBodyHash || false
      };
      break;

    case 'oauth2':
      jackpostAuth.mode = 'oauth2';
      jackpostAuth.oauth2 = toJackpostOAuth2(auth);
      break;

    default:
      console.warn('toJackpostAuth failed: Unsupported auth type');
      break;
  }

  return jackpostAuth;
};
