import { Observable, ApolloLink } from '@apollo/client';
import {
  createVariableInputMutationsLink,
  mutateVariableInputObject,
} from './variableInputMutationsLink'; // replace with actual module path
import { MockedFunction } from 'vitest';

describe('createVariableInputMutationsLink', () => {
  it('should mutate variables in the operation', () => {
    const mockForward = vi.fn(
      (operation: ApolloLink.Operation) =>
        operation as unknown as Observable<ApolloLink.Result>
    ) as MockedFunction<ApolloLink.ForwardFunction>;
    const mockOperation: ApolloLink.Operation = {
      variables: {
        key1: { __typename: 'TypeName', value: 'value1' },
        key2: 'value2',
      },
    } as unknown as ApolloLink.Operation;

    const link = createVariableInputMutationsLink();
    link.request(mockOperation, mockForward);

    expect(mockOperation.variables).toEqual({
      key1: { value: 'value1' },
      key2: 'value2',
    });
  });
});

describe('mutateVariableInputObject', () => {
  it('should remove specified property from object', () => {
    const input = { key1: 'value1', __typename: 'TypeName' };
    const result = mutateVariableInputObject(input, '__typename');

    expect(result).toEqual({ key1: 'value1' });
  });

  it('should recursively remove specified property from nested objects', () => {
    const input = {
      key1: { nestedKey: 'nestedValue', __typename: 'TypeName' },
      key2: 'value2',
    };
    const result = mutateVariableInputObject(input, '__typename');

    expect(result).toEqual({
      key1: { nestedKey: 'nestedValue' },
      key2: 'value2',
    });
  });

  it('should handle arrays of objects', () => {
    const input = [
      { key1: 'value1', __typename: 'TypeName' },
      { key2: 'value2', __typename: 'TypeName' },
    ];
    const result = mutateVariableInputObject(input, '__typename');

    expect(result).toEqual([{ key1: 'value1' }, { key2: 'value2' }]);
  });

  it('should stringify configuration and customTheme objects without __typename', () => {
    const input = {
      configuration: { key1: 'value1' },
      customTheme: { key2: 'value2' },
      other: { __typename: 'TypeName', key3: 'value3' },
    };
    const result = mutateVariableInputObject(input, '__typename');

    expect(result).toEqual({
      configuration: '{"key1":"value1"}',
      customTheme: '{"key2":"value2"}',
      other: { key3: 'value3' },
    });
  });

  it('should not stringify configuration and customTheme objects with __typename', () => {
    const input = {
      configuration: { key1: 'value1', __typename: 'TypeName' },
      customTheme: { key2: 'value2', __typename: 'TypeName' },
    };
    const result = mutateVariableInputObject(input, '__typename');

    expect(result).toEqual({
      configuration: { key1: 'value1' },
      customTheme: { key2: 'value2' },
    });
  });

  it('should handle null and undefined values', () => {
    expect(mutateVariableInputObject(null, '__typename')).toBeNull();
    expect(mutateVariableInputObject(undefined, '__typename')).toBeUndefined();
  });

  it('should not process File instances in the browser', () => {
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = { key1: mockFile, key2: 'value2' };
    const result = mutateVariableInputObject(input, '__typename');

    expect(result).toEqual(input);
  });
});
