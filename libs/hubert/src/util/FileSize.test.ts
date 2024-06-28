import { FileSize, FileSizeUnit } from './FileSize';

describe('FileSize', () => {
  it('should correctly initialize', () => {
    const fileSize = new FileSize(1024);
    expect(fileSize.bytes).toBe(1024);
    expect(fileSize.options.fixed).toBe(2);
    expect(fileSize.options.spacer).toBe(' ');
  });

  it('should convert bytes to specified unit', () => {
    const fileSize = new FileSize(1024);
    expect(fileSize.to(FileSizeUnit.KiloBytes)).toBe('1.00');
    expect(fileSize.to(FileSizeUnit.KiloBytes, 'iec')).toBe('1.00');
    expect(fileSize.to(FileSizeUnit.KiloBytes, 'si')).toBe('1.02');
  });

  it('should humanize bytes', () => {
    const fileSizes = [
      new FileSize(1024),
      new FileSize(5_000_000),
      new FileSize(1_000_000_000),
    ];
    expect(fileSizes[0].humanize()).toBe('1.00 KiB');
    expect(fileSizes[0].humanize('si')).toBe('1.02 kB');

    expect(fileSizes[1].humanize()).toBe('4.77 MiB');
    expect(fileSizes[1].humanize('si')).toBe('5.00 MB');

    expect(fileSizes[2].humanize()).toBe('953.67 MiB');
    expect(fileSizes[2].humanize('si')).toBe('1.00 GB');
  });
});
