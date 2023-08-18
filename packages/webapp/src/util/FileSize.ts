export interface CalculationResult {
  suffix: string;
  magnitude: number;
  result: number;
  fixed: string;
  bits: {
    result: number;
    fixed: string;
  };
}

export interface FileSizeOptions {
  fixed: number;
  spacer: string;
}

export enum FileSizeUnit {
  Bytes = 'B',
  KiloBytes = 'K',
  MegaBytes = 'M',
  GigaBytes = 'G',
  TerraBytes = 'T',
  PetaBytes = 'P',
  ExaBytes = 'E',
  ZettaBytes = 'Z',
  YottaBytes = 'Y',
}

const units = [
  FileSizeUnit.Bytes,
  FileSizeUnit.KiloBytes,
  FileSizeUnit.MegaBytes,
  FileSizeUnit.GigaBytes,
  FileSizeUnit.TerraBytes,
  FileSizeUnit.PetaBytes,
  FileSizeUnit.ExaBytes,
  FileSizeUnit.ZettaBytes,
  FileSizeUnit.YottaBytes,
];

const equals = (a: string, b: string): boolean => {
  return !!a && a.toLowerCase() === b.toLowerCase();
};

export type FileSizeSpec = 'si' | 'iec' | 'jedec';

export class FileSize {
  public bytes: number;

  public options: FileSizeOptions;

  public constructor(bytes: number, options: Partial<FileSizeOptions> = {}) {
    this.bytes = bytes;
    this.options = {
      fixed: 2,
      spacer: ' ',
      ...options,
    };
  }

  public to(
    unit: FileSizeUnit = FileSizeUnit.Bytes,
    spec: FileSizeSpec = 'iec'
  ): string {
    const algorithm = equals(spec, 'si') ? 1e3 : 1024;

    let position = units.indexOf(unit);
    let result = this.bytes;

    if (position === -1 || position === 0) {
      return result.toFixed(2);
    }
    for (; position > 0; position -= 1) {
      result /= algorithm;
    }
    return result.toFixed(2);
  }

  protected calculate(spec: FileSizeSpec = 'iec'): CalculationResult {
    const type = equals(spec, 'si') ? ['k', 'B'] : ['K', 'iB'];
    const algorithm = equals(spec, 'si') ? 1e3 : 1024;
    const magnitude = (Math.log(this.bytes) / Math.log(algorithm)) | 0; // eslint-disable-line no-bitwise
    const result = this.bytes / algorithm ** magnitude;
    const fixed = result.toFixed(this.options.fixed);

    if (magnitude - 1 < 3 && !equals(spec, 'si') && equals(spec, 'jedec'))
      type[1] = 'B';

    let suffix: string;

    if (magnitude) {
      suffix = `${type[0]}MGTPEZY`[magnitude - 1] + type[1];
    } else {
      suffix =
        (this.options.fixed | 0) === 1 // eslint-disable-line no-bitwise
          ? 'Byte'
          : 'Bytes';
    }

    return {
      suffix,
      magnitude,
      result,
      fixed,
      bits: {
        result: result / 8,
        fixed: (result / 8).toFixed(this.options.fixed),
      },
    };
  }

  public humanize(spec?: FileSizeSpec): string {
    const output = this.calculate(spec);
    return output.fixed + this.options.spacer + output.suffix;
  }
}
