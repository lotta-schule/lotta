import { ApolloLink } from '@apollo/client';
const isBrowser = typeof window !== 'undefined';

export const createVariableInputMutationsLink = () =>
  new ApolloLink((operation, forward) => {
    if (operation.variables) {
      operation.variables = mutateVariableInputObject(
        operation.variables,
        '__typename'
      );
    }
    return forward(operation);
  });

export const mutateVariableInputObject = (
  obj: any,
  propToDelete: string
): any => {
  if (obj instanceof Array) {
    return [...obj.map((o) => mutateVariableInputObject(o, propToDelete))];
  } else if (obj !== null && obj !== undefined && typeof obj === 'object') {
    return Object.keys(obj).reduce((newObj, key) => {
      if (
        (key === 'configuration' || key === 'customTheme') &&
        obj[key] &&
        typeof obj[key] === 'object' &&
        !obj[key]['__typename']
      ) {
        return {
          ...newObj,
          [key]: JSON.stringify(obj[key]),
        };
      }
      if (
        typeof obj[key] === 'object' &&
        !(isBrowser && obj[key] instanceof File)
      ) {
        return {
          ...newObj,
          [key]: mutateVariableInputObject(obj[key], propToDelete),
        };
      }
      if (key !== propToDelete) {
        return {
          ...newObj,
          [key]: obj[key],
        };
      }
      return {
        ...newObj,
      };
    }, {});
  }
  return obj;
};
