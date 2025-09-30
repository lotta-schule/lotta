import { renderHook } from 'test/util';
import { useUserGroups } from './useUserGroups';
import {
  adminGroup,
  lehrerGroup,
  schuelerGroup,
  elternGroup,
} from 'test/fixtures';

const mockUserGroupsWithEduplacesId = [
  adminGroup,
  {
    ...lehrerGroup,
    eduplacesId: 'edu_teachers_123',
  },
  {
    ...schuelerGroup,
    eduplacesId: 'edu_students_456',
  },
  elternGroup,
];

describe('useUserGroups', () => {
  it('should return user groups with eduplacesId support', async () => {
    const { result } = renderHook(
      () => useUserGroups(),
      {},
      { userGroups: mockUserGroupsWithEduplacesId }
    );

    await vi.waitFor(() => {
      const userGroups = result.current;
      expect(userGroups).toHaveLength(4);

      expect(userGroups[0]).toMatchObject({
        id: adminGroup.id,
        name: adminGroup.name,
        isAdminGroup: adminGroup.isAdminGroup,
        eduplacesId: null,
      });

      expect(userGroups[1]).toMatchObject({
        id: lehrerGroup.id,
        name: lehrerGroup.name,
        isAdminGroup: lehrerGroup.isAdminGroup,
        eduplacesId: 'edu_teachers_123',
      });
    });
  });

  it('should include eduplacesId field in user groups', async () => {
    const { result } = renderHook(
      () => useUserGroups(),
      {},
      { userGroups: mockUserGroupsWithEduplacesId }
    );

    await vi.waitFor(() => {
      const userGroups = result.current;
      expect(userGroups).toHaveLength(4);

      expect(userGroups[0].eduplacesId).toBe(null);
      expect(userGroups[1].eduplacesId).toBe('edu_teachers_123');
      expect(userGroups[2].eduplacesId).toBe('edu_students_456');
      expect(userGroups[3].eduplacesId).toBe(null);
    });
  });

  it('should handle groups with and without eduplacesId', async () => {
    const { result } = renderHook(
      () => useUserGroups(),
      {},
      { userGroups: mockUserGroupsWithEduplacesId }
    );

    await vi.waitFor(() => {
      const adminGroup = result.current.find((g) => g.isAdminGroup);
      const teacherGroup = result.current.find((g) => g.name === 'Lehrer');
      const studentGroup = result.current.find((g) => g.name === 'Schüler');

      expect(adminGroup?.eduplacesId).toBe(null);
      expect(teacherGroup?.eduplacesId).toBe('edu_teachers_123');
      expect(studentGroup?.eduplacesId).toBe('edu_students_456');
    });
  });

  it('should return groups with correct properties', async () => {
    const { result } = renderHook(
      () => useUserGroups(),
      {},
      { userGroups: mockUserGroupsWithEduplacesId }
    );

    await vi.waitFor(() => {
      const groups = result.current;

      groups.forEach((group) => {
        expect(group).toHaveProperty('id');
        expect(group).toHaveProperty('name');
        expect(group).toHaveProperty('isAdminGroup');
        expect(group).toHaveProperty('sortKey');
        expect(group).toHaveProperty('canReadFullName');
        expect(group).toHaveProperty('eduplacesId');
      });
    });
  });
});
