import { JackpostError } from 'utils/common/error';
import { buildEnvVariable, coerceEnvColor } from 'utils/environments';
import { coerceEnvName, dedupeImportedSecrets, validatedEnvironmentExtendsFrom } from '@jackpost/common/utils';

const validateJackpostEnvironment = (env, filePath, fileName) => {
  if (!env || typeof env !== 'object') {
    throw new JackpostError('Invalid environment: expected an object');
  }

  const name = coerceEnvName(env.name);
  if (name === null) {
    throw new JackpostError('Invalid environment: missing or invalid name');
  }

  if (!Array.isArray(env.variables)) {
    throw new JackpostError('Invalid environment: missing or invalid variables array');
  }

  // Validate each variable
  env.variables.forEach((variable, index) => {
    if (!variable || typeof variable !== 'object') {
      throw new JackpostError(`Invalid variable at index ${index}: expected an object`);
    }
    if (!variable.name || typeof variable.name !== 'string') {
      throw new JackpostError(`Invalid variable at index ${index}: missing or invalid name`);
    }
  });

  const environmentExtendsFrom = validatedEnvironmentExtendsFrom(env.extends);
  const hasExtendsReference = env.extends !== undefined && env.extends !== null && env.extends !== '';
  if (hasExtendsReference && !environmentExtendsFrom) {
    throw new JackpostError('Invalid environment: extends is not a valid environment name');
  }

  const variables = env.variables.map((envVariable) => buildEnvVariable({ envVariable, withUuid: true }));

  return {
    name,
    variables: dedupeImportedSecrets(variables),
    color: coerceEnvColor(env.color),
    extends: environmentExtendsFrom,
    filePath,
    fileName
  };
};

const processEnvironmentData = (data, fileName, filePath) => {
  const valid = [];
  const invalid = [];

  try {
    // Handle new single-file format with environments array
    if (data.info && data.info.type === 'jackpost-environment' && Array.isArray(data.environments)) {
      data.environments.forEach((env, index) => {
        try {
          valid.push(validateJackpostEnvironment(env, filePath, fileName));
        } catch (err) {
          invalid.push({ fileName, error: err.message });
        }
      });
      return { valid, invalid };
    }

    // Handle array of environments (old format)
    if (Array.isArray(data)) {
      data.forEach((env, index) => {
        try {
          valid.push(validateJackpostEnvironment(env, filePath, fileName));
        } catch (err) {
          invalid.push({ fileName, error: err.message });
        }
      });
      return { valid, invalid };
    }

    // Handle single environment object
    try {
      valid.push(validateJackpostEnvironment(data, filePath, fileName));
    } catch (err) {
      invalid.push({ fileName, error: err.message });
    }
    return { valid, invalid };
  } catch (err) {
    invalid.push({ fileName, error: `Error processing ${fileName}: ${err.message}` });
    return { valid, invalid };
  }
};

const processFiles = (parsedFiles) => {
  const allValid = [];
  const allInvalid = [];

  for (const parsedFile of parsedFiles) {
    try {
      const { valid, invalid } = processEnvironmentData(parsedFile.content, parsedFile.fileName, parsedFile.filePath);
      allValid.push(...valid);
      allInvalid.push(...invalid);
    } catch (err) {
      allInvalid.push({ fileName: parsedFile.fileName, error: `Failed to process ${parsedFile.fileName}: ${err.message}` });
    }
  }

  return { valid: allValid, invalid: allInvalid };
};

const importJackpostEnvironment = (parsedFiles) => {
  try {
    if (!parsedFiles || parsedFiles.length === 0) {
      throw new JackpostError('No files provided');
    }

    const result = processFiles(parsedFiles);
    return result;
  } catch (err) {
    console.error(err);
    throw err instanceof JackpostError ? err : new JackpostError('Import Jackpost environment failed');
  }
};

export { importJackpostEnvironment, processEnvironmentData };
export default importJackpostEnvironment;
