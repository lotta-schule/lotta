import * as React from 'react';
import { render } from 'test/util';
import { Usage } from './Usage';
import { TenantUsage } from 'loader';
import { TenantModel } from 'model';

vi.useFakeTimers({
  shouldAdvanceTime: true,
  now: new Date('2025-06-15T12:00:00.000Z'),
});

const MB = 1024 ** 2;
const GB = 1024 ** 3;

describe('Usage', () => {
  const mockTenant: TenantModel = {
    id: '1',
    title: 'Test School',
    host: 'test.lotta.schule',
    slug: 'test',
    insertedAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2025-06-01T10:00:00.000Z',
    configuration: {
      userMaxStorageConfig: '20971520',
      customTheme: {},
    },
  };

  const mockUsage: TenantUsage = [
    {
      year: 2025,
      month: 4,
      activeUserCount: {
        value: 150,
        updatedAt: '2025-04-30T23:59:59.000Z',
      },
      totalStorageCount: {
        value: 500 * MB,
        updatedAt: '2025-04-30T23:59:59.000Z',
      },
      mediaConversionSeconds: {
        value: 45,
        updatedAt: '2025-04-30T23:59:59.000Z',
      },
    },
    {
      year: 2025,
      month: 5,
      activeUserCount: {
        value: 180,
        updatedAt: '2025-05-31T23:59:59.000Z',
      },
      totalStorageCount: {
        value: 1 * 1024 ** 3, // 1 GB
        updatedAt: '2025-05-31T23:59:59.000Z',
      },
      mediaConversionSeconds: {
        value: 120,
        updatedAt: '2025-05-31T23:59:59.000Z',
      },
    },
    {
      year: 2025,
      month: 6,
      activeUserCount: {
        value: 200,
        updatedAt: '2025-06-15T12:00:00.000Z',
      },
      totalStorageCount: {
        value: 2 * GB,
        updatedAt: '2025-06-15T12:00:00.000Z',
      },
      mediaConversionSeconds: {
        value: 3600,
        updatedAt: '2025-06-15T12:00:00.000Z',
      },
    },
  ];

  describe('renders tenant information', () => {
    it('should display tenant host, title and creation date', () => {
      const screen = render(<Usage usage={mockUsage} tenant={mockTenant} />);

      expect(screen.getByText('test.lotta.schule')).toBeVisible();
      expect(screen.getByText('Test School')).toBeVisible();
      expect(screen.getByText('2024-01-15T10:00:00.000Z')).toBeVisible();
    });
  });

  describe('renders usage table headers', () => {
    it('should display all column headers', () => {
      const screen = render(<Usage usage={mockUsage} tenant={mockTenant} />);

      expect(screen.getByText('aktive Nutzer')).toBeVisible();
      expect(screen.getByText('Speicherplatz')).toBeVisible();
      expect(screen.getByText('Multimedia')).toBeVisible();
    });
  });

  describe('renders usage data', () => {
    it('should display usage data for all months', () => {
      const screen = render(<Usage usage={mockUsage} tenant={mockTenant} />);

      expect(screen.getByText('April 2025')).toBeVisible();
      expect(screen.getByText('Mai 2025')).toBeVisible();
      expect(screen.getByText('Juni 2025')).toBeVisible();

      expect(screen.getByText('150')).toBeVisible();
      expect(screen.getByText('180')).toBeVisible();
      expect(screen.getByText('200')).toBeVisible();
    });

    it('should format storage sizes correctly', () => {
      const screen = render(<Usage usage={mockUsage} tenant={mockTenant} />);

      const cells = screen.getAllByRole('cell');
      const storageCells = cells.filter(
        (cell) =>
          cell.textContent?.includes('B') ||
          cell.textContent?.includes('MB') ||
          cell.textContent?.includes('GB')
      );

      expect(storageCells.length).toBeGreaterThan(0);
    });

    it('should format media conversion time in seconds', () => {
      const usage: TenantUsage = [
        {
          year: 2025,
          month: 4,
          activeUserCount: {
            value: 150,
            updatedAt: '2025-04-30T23:59:59.000Z',
          },
          totalStorageCount: {
            value: 500 * MB,
            updatedAt: '2025-04-30T23:59:59.000Z',
          },
          mediaConversionSeconds: {
            value: 45,
            updatedAt: '2025-04-30T23:59:59.000Z',
          },
        },
      ];

      const screen = render(<Usage usage={usage} tenant={mockTenant} />);

      expect(screen.getByText(/45 Sekunden/)).toBeVisible();
    });

    it('should format media conversion time in minutes', () => {
      const usage: TenantUsage = [
        {
          year: 2025,
          month: 5,
          activeUserCount: {
            value: 180,
            updatedAt: '2025-05-31T23:59:59.000Z',
          },
          totalStorageCount: {
            value: 1 * GB,
            updatedAt: '2025-05-31T23:59:59.000Z',
          },
          mediaConversionSeconds: {
            value: 120,
            updatedAt: '2025-05-31T23:59:59.000Z',
          },
        },
      ];

      const screen = render(<Usage usage={usage} tenant={mockTenant} />);

      expect(screen.getByText(/2 Minuten/)).toBeVisible();
    });
  });

  describe('handles empty or missing data', () => {
    it('should render with empty usage array', () => {
      const screen = render(<Usage usage={[]} tenant={mockTenant} />);

      expect(screen.getByText('Test School')).toBeVisible();
      expect(screen.getByText('aktive Nutzer')).toBeVisible();
    });

    it('should handle null active user count', () => {
      const usage: TenantUsage = [
        {
          year: 2025,
          month: 6,
          activeUserCount: null,
          totalStorageCount: {
            value: 1 * GB,
            updatedAt: '2025-06-15T12:00:00.000Z',
          },
          mediaConversionSeconds: {
            value: 120,
            updatedAt: '2025-06-15T12:00:00.000Z',
          },
        },
      ];

      const screen = render(<Usage usage={usage} tenant={mockTenant} />);

      expect(screen.getByText('Juni 2025')).toBeVisible();
    });

    it('should handle null total storage count', () => {
      const usage: TenantUsage = [
        {
          year: 2025,
          month: 6,
          activeUserCount: {
            value: 200,
            updatedAt: '2025-06-15T12:00:00.000Z',
          },
          totalStorageCount: null,
          mediaConversionSeconds: {
            value: 120,
            updatedAt: '2025-06-15T12:00:00.000Z',
          },
        },
      ];

      const screen = render(<Usage usage={usage} tenant={mockTenant} />);

      expect(screen.getByText('Juni 2025')).toBeVisible();
      expect(screen.getByText('200')).toBeVisible();
    });

    it('should handle null media conversion seconds', () => {
      const usage: TenantUsage = [
        {
          year: 2025,
          month: 6,
          activeUserCount: {
            value: 200,
            updatedAt: '2025-06-15T12:00:00.000Z',
          },
          totalStorageCount: {
            value: 1 * GB,
            updatedAt: '2025-06-15T12:00:00.000Z',
          },
          mediaConversionSeconds: null,
        },
      ];

      const screen = render(<Usage usage={usage} tenant={mockTenant} />);

      expect(screen.getByText('Juni 2025')).toBeVisible();
      expect(screen.getByText('200')).toBeVisible();
    });

    it('should handle zero media conversion seconds', () => {
      const usage: TenantUsage = [
        {
          year: 2025,
          month: 6,
          activeUserCount: {
            value: 200,
            updatedAt: '2025-06-15T12:00:00.000Z',
          },
          totalStorageCount: {
            value: 1 * GB,
            updatedAt: '2025-06-15T12:00:00.000Z',
          },
          mediaConversionSeconds: {
            value: 0,
            updatedAt: '2025-06-15T12:00:00.000Z',
          },
        },
      ];

      const screen = render(<Usage usage={usage} tenant={mockTenant} />);

      expect(screen.getByText(/0 Sekunden/)).toBeVisible();
    });
  });

  describe('highlights current month', () => {
    it('should apply current month styling to June 2025', () => {
      const screen = render(<Usage usage={mockUsage} tenant={mockTenant} />);

      const rows = screen.getAllByRole('row');

      const juneRow = rows.find((row) =>
        row.textContent?.includes('Juni 2025')
      );
      expect(juneRow).toBeDefined();
      expect(juneRow?.className).toContain('isCurrentMonth');
    });

    it('should not apply current month styling to other months', () => {
      const screen = render(<Usage usage={mockUsage} tenant={mockTenant} />);

      const rows = screen.getAllByRole('row');

      const aprilRow = rows.find((row) =>
        row.textContent?.includes('April 2025')
      );
      expect(aprilRow).toBeDefined();
      expect(aprilRow?.className).not.toContain('isCurrentMonth');

      const mayRow = rows.find((row) => row.textContent?.includes('Mai 2025'));
      expect(mayRow).toBeDefined();
      expect(mayRow?.className).not.toContain('isCurrentMonth');
    });
  });

  describe('table structure', () => {
    it('should have proper ARIA roles', () => {
      const screen = render(<Usage usage={mockUsage} tenant={mockTenant} />);

      expect(screen.getByRole('table')).toBeVisible();
      expect(screen.getAllByRole('row').length).toBeGreaterThan(0);
      expect(screen.getAllByRole('cell').length).toBeGreaterThan(0);
    });
  });
});
