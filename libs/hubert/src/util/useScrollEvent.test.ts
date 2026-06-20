import { renderHook, act } from '@testing-library/react';
import { useScrollEvent } from './useScrollEvent';

describe('useScrollEvent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call callback on scroll', () => {
    const callback = vi.fn();
    renderHook(() => useScrollEvent(callback));

    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(250);
    });

    expect(callback).toHaveBeenCalled();
  });

  it('should throttle scroll events', () => {
    const callback = vi.fn();
    renderHook(() => useScrollEvent(callback, 500));

    // Trigger multiple scroll events quickly
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(250);
    });

    // Should only be called once due to throttling
    expect(callback).toHaveBeenCalledTimes(1);

    // Wait for throttle to reset
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Trigger again
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should use custom throttle threshold', () => {
    const callback = vi.fn();
    renderHook(() => useScrollEvent(callback, 100));

    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(50);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(100);
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should respect dependencies in callback', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ dep }) => useScrollEvent(callback, 250, [dep]),
      { initialProps: { dep: 'initial' } }
    );

    rerender({ dep: 'updated' });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(250);
    });

    expect(callback).toHaveBeenCalled();
  });

  it('should cleanup event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const callback = vi.fn();

    const { unmount } = renderHook(() => useScrollEvent(callback));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });
});
