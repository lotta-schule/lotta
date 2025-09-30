import { renderHook } from 'test/util';
import { useTenant } from './useTenant';
import { tenant } from 'test/fixtures';

describe('useTenant', () => {
  it('should return tenant with eduplacesId support', () => {
    const mockTenant = {
      ...tenant,
      eduplacesId: '123',
    };

    const { result } = renderHook(
      () => useTenant(),
      {},
      { tenant: mockTenant }
    );

    expect(result.current).toEqual(mockTenant);
    expect(result.current.eduplacesId).toBe('123');
  });

  it('should handle tenant without eduplacesId', () => {
    const mockTenant = {
      ...tenant,
      eduplacesId: null,
    };

    const { result } = renderHook(
      () => useTenant(),
      {},
      { tenant: mockTenant }
    );

    expect(result.current).toEqual(mockTenant);
    expect(result.current.eduplacesId).toBe(null);
  });

  it('should return default tenant when no tenant provided', () => {
    const { result } = renderHook(() => useTenant());

    expect(result.current).toEqual(tenant);
    expect(result.current).toHaveProperty('eduplacesId');
  });
});
