import { renderHook } from '@testing-library/react';
import { usePreventScroll } from './usePreventScroll';

vi.mock('./usePreventScroll', async () => {
  const actual = await vi.importActual('./usePreventScroll');
  return { ...actual, preventScrollCount: 0 };
});

describe('usePreventScroll', () => {
  let originalOverflow: string;
  let originalPaddingRight: string;

  beforeEach(() => {
    originalOverflow = document.documentElement.style.overflow;
    originalPaddingRight = document.documentElement.style.paddingRight;
  });

  afterEach(() => {
    document.documentElement.style.overflow = originalOverflow;
    document.documentElement.style.paddingRight = originalPaddingRight;
  });

  it('should set overflow hidden on mount', () => {
    renderHook(() => usePreventScroll());

    expect(document.documentElement.style.overflow).toBe('hidden');
  });

  it('should set padding-right to scrollbar width', () => {
    renderHook(() => usePreventScroll());

    const paddingRight = document.documentElement.style.paddingRight;
    expect(paddingRight).toMatch(/^\d+px$/);
  });

  it('should not set styles when disabled', () => {
    renderHook(() => usePreventScroll({ isDisabled: true }));

    expect(document.documentElement.style.overflow).toBe('');
    expect(document.documentElement.style.paddingRight).toBe('');
  });

  it('should restore styles on unmount', () => {
    const { unmount } = renderHook(() => usePreventScroll());

    expect(document.documentElement.style.overflow).toBe('hidden');

    unmount();

    expect(document.documentElement.style.overflow).toBe(originalOverflow);
  });

  it('should handle multiple calls correctly', () => {
    const { unmount: unmount1 } = renderHook(() => usePreventScroll());
    const { unmount: unmount2 } = renderHook(() => usePreventScroll());

    expect(document.documentElement.style.overflow).toBe('hidden');

    unmount1();

    // Should still be hidden because second hook is active
    expect(document.documentElement.style.overflow).toBe('hidden');

    unmount2();

    // Should be restored now
    expect(document.documentElement.style.overflow).toBe(originalOverflow);
  });
});
