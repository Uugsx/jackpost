const fs = require('node:fs');
const path = require('node:path');
const { walk, defaultClassify, resolveDenylist } = require('./mount');
const { parseRequest, parseEnvironment, parseCollection } = require('@jackpost/filestore');

const resolveConfigFile = (collectionPath) => {
  if (fs.existsSync(path.join(collectionPath, 'opencollection.yml'))) return 'opencollection.yml';
  if (fs.existsSync(path.join(collectionPath, 'jackpost.json'))) return 'jackpost.json';
  return null;
};

const readCollectionConfig = async (collectionPath) => {
  const configFile = resolveConfigFile(collectionPath);
  if (!configFile) {
    throw new Error(`No jackpost.json or opencollection.yml found in ${collectionPath}`);
  }

  const configPath = path.join(collectionPath, configFile);
  try {
    if (configFile === 'opencollection.yml') {
      const parsed = await parseCollection(fs.readFileSync(configPath, 'utf8'), { format: 'yml' });
      return { configFile, jackpostConfig: parsed?.jackpostConfig || null, configParsed: true };
    }
    return { configFile, jackpostConfig: JSON.parse(fs.readFileSync(configPath, 'utf8')), configParsed: true };
  } catch (err) {
    console.error(`Failed to parse ${configFile}:`, err);
    return { configFile, jackpostConfig: null, configParsed: false };
  }
};

const readCollectionForApiSpec = async (collectionPath) => {
  const { configFile, jackpostConfig, configParsed } = await readCollectionConfig(collectionPath);

  const requests = [];
  const envVariables = {};
  const collectionVariables = {};
  const skipped = [];

  const markSkipped = (relativePath) => {
    if (!skipped.includes(relativePath)) {
      skipped.push(relativePath);
    }
  };

  if (!configParsed) {
    markSkipped(configFile);
  }

  const collect = async (label, relativePath, read) => {
    try {
      await read();
    } catch (err) {
      console.error(`Failed to parse ${label} ${relativePath}:`, err);
      markSkipped(relativePath);
    }
  };

  for (const { relativePath, absolutePath } of walk(collectionPath, resolveDenylist(jackpostConfig?.ignore))) {
    const basename = path.basename(relativePath);

    const classification = defaultClassify(relativePath);
    if (!classification) continue;
    const { format, type } = classification;

    switch (type) {
      case 'request':
        await collect('request', relativePath, async () => {
          const item = await parseRequest(fs.readFileSync(absolutePath, 'utf8'), { format });
          requests.push({ ...item, pathname: absolutePath, depth: relativePath.split(path.sep).filter(Boolean).length });
        });
        break;

      case 'environment':
        await collect('environment', relativePath, async () => {
          const environment = await parseEnvironment(fs.readFileSync(absolutePath, 'utf8'), { format });
          const environmentName = basename.replace(/\.(jp|ya?ml)$/i, '');
          envVariables[environmentName] = environment.variables;
        });
        break;

      case 'collection':
        await collect('collection root', relativePath, async () => {
          const parsed = await parseCollection(fs.readFileSync(absolutePath, 'utf8'), { format });
          const collectionRoot = parsed?.collectionRoot || parsed;
          const collectionRootVars = collectionRoot?.request?.vars?.req || [];
          collectionRootVars.forEach((variable) => {
            if (variable.enabled) collectionVariables[variable.name] = variable.value;
          });
        });
        break;

      default:
        break;
    }
  }

  return {
    configFile,
    requests,
    envVariables,
    collectionVariables,
    skipped
  };
};

module.exports = { readCollectionForApiSpec };
