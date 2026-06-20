import * as React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useElementFullWindowHeight } from './useElementFullWindowHeight';

describe('useElementFullWindowHeight', () => {
  let mockElement: HTMLElement;
  let mockMainElement: HTMLElement;

  beforeEach(() => {
    // Create mock elements
    mockElement = document.createElement('div');
    mockElement.offsetTop = 100;
    document.body.appendChild(mockElement);

    mockMainElement = document.createElement('main');
    mockMainElement.style.marginTop = '20px';
    mockMainElement.style.paddingBottom = '10px';
    document.body.appendChild(mockMainElement);

    // Mock querySelector
    vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
      if (selector === 'main') {
        return mockMainElement;
      }
      return null;
    });

    // Mock getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      marginTop: '20px',
      paddingBottom: '10px',
    } as CSSStyleDeclaration);

    // Mock window.innerHeight
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: 1080,
    });

    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn();
      threshold = 0;
      root = null;
      rootMargin = '';
      constructor(callback: IntersectionObserverCallback) {
        // Store callback for testing
      }
    } as any;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('should return null initially', () => {
    const elementRef = React.createRef<HTMLElement>();
    const { result } = renderHook(() => useElementFullWindowHeight(elementRef));

    expect(result.current).toBeNull();
  });

  it('should calculate height when element ref is set', async () => {
    const elementRef = React.createRef<HTMLElement>();
    elementRef.current = mockElement;

    const { result } = renderHook(() => useElementFullWindowHeight(elementRef));

    // Wait for effect to run
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Expected: 1080 - 100 - 20 - 10 = 950
    expect(result.current).toBe(950);
  });

  it('should update height on window resize', async () => {
    const elementRef = React.createRef<HTMLElement>();
    elementRef.current = mockElement;

    const { result, rerender } = renderHook(() =>
      useElementFullWindowHeight(elementRef)
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Change window height
    act(() => {
      window.innerHeight = 800;
      window.dispatchEvent(new Event('resize'));
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Expected: 800 - 100 - 20 - 10 = 670
    expect(result.current).toBe(670);
  });

  it('should handle missing main element', async () => {
    vi.spyOn(document, 'querySelector').mockReturnValue(null);

    const elementRef = React.createRef<HTMLElement>();
    elementRef.current = mockElement;

    const { result } = renderHook(() => useElementFullWindowHeight(elementRef));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Expected: 1080 - 100 - 0 - 0 = 980
    expect(result.current).toBe(980);
  });

  it('should handle undefined IntersectionObserver', async () => {
    const originalObserver = global.IntersectionObserver;
    global.IntersectionObserver = undefined as any;

    const elementRef = React.createRef<HTMLElement>();
    elementRef.current = mockElement;

    const { result } = renderHook(() => useElementFullWindowHeight(elementRef));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current).toBe(950);

    global.IntersectionObserver = originalObserver;
  });

  it('should cleanup resize listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const elementRef = React.createRef<HTMLElement>();
    elementRef.current = mockElement;

    const { unmount } = renderHook(() =>
      useElementFullWindowHeight(elementRef)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });
});
