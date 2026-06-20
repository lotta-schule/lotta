import { renderHook, waitFor } from '@testing-library/react';
import { useWindowSize } from './useWindowSize';

describe('useWindowSize', () => {
  it('should return initial window size', () => {
    const { result } = renderHook(() => useWindowSize());

    expect(result.current).toEqual({
      innerHeight: expect.any(Number),
      innerWidth: expect.any(Number),
      outerHeight: expect.any(Number),
      outerWidth: expect.any(Number),
    });
  });

  it('should update on window resize', async () => {
    const { result } = renderHook(() => useWindowSize());

    const initialSize = { ...result.current };

    // Simulate resize
    act(() => {
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      expect(result.current.innerWidth).toBe(1920);
      expect(result.current.innerHeight).toBe(1080);
    });

    // Restore
    window.innerWidth = initialSize.innerWidth;
    window.innerHeight = initialSize.innerHeight;
  });

  it('should have consistent size object structure', () => {
    const { result } = renderHook(() => useWindowSize());

    const size = result.current;
    expect(Object.keys(size)).toEqual([
      'innerHeight',
      'innerWidth',
      'outerHeight',
      'outerWidth',
    ]);
  });
});
