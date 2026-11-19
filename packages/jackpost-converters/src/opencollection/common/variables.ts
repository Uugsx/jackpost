import { uuid } from '../../common/index.js';
import type {
  Variable,
  JackpostVariable,
  JackpostVariables
} from '../types';
import {
  isTypedValue,
  hasTypedMetadata,
  toOpenCollectionTypedValue,
  fromOpenCollectionTypedValue,
  serializeVariableValue
} from './datatype';

interface JackpostVars {
  req: JackpostVariables;
  res: JackpostVariables;
}

export const fromOpenCollectionVariables = (variables: Variable[] | undefined): JackpostVars => {
  if (!variables?.length) {
    return { req: [], res: [] };
  }

  const reqVars: JackpostVariable[] = [];

  variables.forEach((v: Variable) => {
    const variable: JackpostVariable = {
      uid: uuid(),
      name: v.name || '',
      value: '',
      enabled: v.disabled !== true,
      local: false
    };

    if (isTypedValue(v.value)) {
      Object.assign(variable, fromOpenCollectionTypedValue(v.value));
    } else if (typeof v.value === 'string') {
      variable.value = v.value;
    }

    if (v.description) {
      variable.description = typeof v.description === 'string'
        ? v.description
        : (v.description as { content?: string })?.content || '';
    }

    reqVars.push(variable);
  });

  return { req: reqVars, res: [] };
};

export const toOpenCollectionVariables = (vars: JackpostVars | { req?: JackpostVariables; res?: JackpostVariables } | null | undefined): Variable[] | undefined => {
  // Handle folder variables (has req/res structure) - only use req vars
  const hasReqRes = vars && 'req' in vars;
  const reqVars = hasReqRes ? vars.req : vars as JackpostVariables;

  const reqVarsArray = Array.isArray(reqVars) ? reqVars : [];

  if (!reqVarsArray.length) {
    return undefined;
  }

  const ocVariables: Variable[] = reqVarsArray.map((v: JackpostVariable): Variable => {
    const valueStr = serializeVariableValue(v.value);
    const variable: Variable = {
      name: v.name || '',
      value: hasTypedMetadata(v) ? toOpenCollectionTypedValue(v, valueStr) : valueStr
    };

    if (v.description && typeof v.description === 'string' && v.description.trim().length) {
      variable.description = v.description;
    }

    if (v.enabled === false) {
      variable.disabled = true;
    }

    return variable;
  });

  return ocVariables.length > 0 ? ocVariables : undefined;
};
