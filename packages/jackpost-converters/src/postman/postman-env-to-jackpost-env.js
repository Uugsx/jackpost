import each from 'lodash/each';
import { invalidVariableCharacterRegex } from '../constants';
import { uuid } from '../common';

const isSecret = (type) => {
  return type === 'secret';
};

const importPostmanEnvironmentVariables = (jackpostEnvironment, values = []) => {
  jackpostEnvironment.variables = jackpostEnvironment.variables || [];

  each(values.filter((i) => !(i.key == null && i.value == null)), (i) => {
    const jackpostEnvironmentVariable = {
      uid: uuid(),
      name: (i.key ?? '').replace(invalidVariableCharacterRegex, '_'),
      value: i.value ?? '',
      enabled: i.enabled ?? true,
      type: 'text',
      secret: isSecret(i.type)
    };

    jackpostEnvironment.variables.push(jackpostEnvironmentVariable);
  });
};

const importPostmanEnvironment = (environment) => {
  const jackpostEnvironment = {
    name: environment.name,
    variables: []
  };

  importPostmanEnvironmentVariables(jackpostEnvironment, environment.values);
  return jackpostEnvironment;
};

export const postmanToJackpostEnvironment = (postmanEnvironment) => {
  try {
    return importPostmanEnvironment(postmanEnvironment);
  } catch (err) {
    throw new Error('Unable to parse the postman environment json file', { cause: err });
  }
};

export default postmanToJackpostEnvironment;
