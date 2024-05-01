import { renderHook, act } from '@testing-library/react';
import { useNodeMenuProps } from './useNodeMenuProps';
import {
  TestBrowserWrapper,
  TestBrowserWrapperProps,
  fixtures,
} from 'test-utils';

describe('browser/useNodeMenuProps', () => {
  const nodePaths = [fixtures.getPathForNode('20')];
  describe('for files', () => {
    test('returns correct menu items for one selected file nodes', () => {
      const onSetCurrentAction = vi.fn();
      const { result } = renderHook(() => useNodeMenuProps(nodePaths), {
        wrapper: ({ children }: TestBrowserWrapperProps) => (
          <TestBrowserWrapper setCurrentAction={onSetCurrentAction}>
            {children}
          </TestBrowserWrapper>
        ),
      });

      expect(result.current.children.length).toBe(3); // Assuming all options are available
      expect(result.current.children.map((item) => item.key)).toEqual([
        'rename',
        'move',
        'delete',
      ]);

      // Simulating click on each menu item and asserting correct action is called
      act(() => {
        result.current.onAction('rename');
      });
      expect(onSetCurrentAction).toHaveBeenCalledWith({
        type: 'rename-node',
        path: nodePaths[0],
      });

      act(() => {
        result.current.onAction('move');
      });
      expect(onSetCurrentAction).toHaveBeenCalledWith({
        type: 'move-nodes',
        paths: nodePaths,
      });

      act(() => {
        result.current.onAction('delete');
      });
      expect(onSetCurrentAction).toHaveBeenCalledWith({
        type: 'delete-files',
        paths: nodePaths,
      });
    });

    test('returns correct menu items for two selected file nodes', () => {
      const nodePaths = [
        fixtures.getPathForNode('20'),
        fixtures.getPathForNode('21'),
      ];
      const onSetCurrentAction = vi.fn();
      const { result } = renderHook(() => useNodeMenuProps(nodePaths), {
        wrapper: ({ children }: TestBrowserWrapperProps) => (
          <TestBrowserWrapper setCurrentAction={onSetCurrentAction}>
            {children}
          </TestBrowserWrapper>
        ),
      });

      expect(result.current.children.length).toBe(2); // Assuming all options are available
      expect(result.current.children.map((item) => item.key)).toEqual([
        'move',
        'delete',
      ]);

      // Simulating click on each menu item and asserting correct action is called
      act(() => {
        result.current.onAction('rename');
      });
      expect(onSetCurrentAction).toHaveBeenCalledWith({
        type: 'rename-node',
        path: nodePaths[0],
      });

      act(() => {
        result.current.onAction('move');
      });
      expect(onSetCurrentAction).toHaveBeenCalledWith({
        type: 'move-nodes',
        paths: nodePaths,
      });

      act(() => {
        result.current.onAction('delete');
      });
      expect(onSetCurrentAction).toHaveBeenCalledWith({
        type: 'delete-files',
        paths: nodePaths,
      });
    });
  });

  describe('for directories', () => {
    const nodePaths = [fixtures.getPathForNode('8')];
    test('returns correct menu items for one selected directory nodes', () => {
      const onSetCurrentAction = vi.fn();
      const { result } = renderHook(() => useNodeMenuProps(nodePaths), {
        wrapper: ({ children }: TestBrowserWrapperProps) => (
          <TestBrowserWrapper setCurrentAction={onSetCurrentAction}>
            {children}
          </TestBrowserWrapper>
        ),
      });

      expect(result.current.children.length).toBe(3); // Assuming all options are available
      expect(result.current.children.map((item) => item.key)).toEqual([
        'rename',
        'move',
        'delete',
      ]);

      // Simulating click on each menu item and asserting correct action is called
      act(() => {
        result.current.onAction('rename');
      });
      expect(onSetCurrentAction).toHaveBeenCalledWith({
        type: 'rename-node',
        path: nodePaths[0],
      });

      act(() => {
        result.current.onAction('move');
      });
      expect(onSetCurrentAction).toHaveBeenCalledWith({
        type: 'move-nodes',
        paths: nodePaths,
      });

      act(() => {
        result.current.onAction('delete');
      });
      expect(onSetCurrentAction).toHaveBeenCalledWith({
        type: 'delete-directory',
        path: nodePaths[0],
      });
    });

    test('returns correct menu items for two selected file nodes', async () => {
      const nodePaths = [
        fixtures.getPathForNode('8'),
        fixtures.getPathForNode('9'),
      ];
      const onSetCurrentAction = vi.fn();
      const { result } = renderHook(() => useNodeMenuProps(nodePaths), {
        wrapper: ({ children }: TestBrowserWrapperProps) => (
          <TestBrowserWrapper setCurrentAction={onSetCurrentAction}>
            {children}
          </TestBrowserWrapper>
        ),
      });

      expect(result.current.children.length).toBe(2); // Assuming all options are available
      expect(result.current.children.map((item) => item.key)).toEqual([
        'move',
        'delete',
      ]);

      act(() => {
        result.current.onAction('move');
      });
      expect(onSetCurrentAction).toHaveBeenCalledWith({
        type: 'move-nodes',
        paths: nodePaths,
      });
    });
  });
});
