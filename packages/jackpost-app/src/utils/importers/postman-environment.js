import { JackpostError } from 'utils/common/error';
import { postmanToJackpostEnvironment } from '@jackpost/converters';
import { coerceEnvName, dedupeImportedSecrets } from '@jackpost/common/utils';

const importEnvironment = async (parsedFiles) => {
  try {
    const valid = [];
    const invalid = [];

    for (const parsedFile of parsedFiles) {
      try {
        const environment = postmanToJackpostEnvironment(parsedFile.content);
        const name = coerceEnvName(environment.name);
        if (name === null) {
          throw new JackpostError('Invalid environment: missing or invalid name');
        }
        valid.push({ ...environment, name, variables: dedupeImportedSecrets(environment.variables), filePath: parsedFile.filePath, fileName: parsedFile.fileName });
      } catch (err) {
        console.error(`Error processing file: ${parsedFile.fileName}`, err);
        invalid.push({ fileName: parsedFile.fileName, error: err.message });
      }
    }

    return { valid, invalid };
  } catch (err) {
    console.log(err);
    throw err instanceof JackpostError ? err : new JackpostError('Import Environment failed');
  }
};

export default importEnvironment;
