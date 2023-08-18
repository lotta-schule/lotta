import { generateArgsTableRows } from './generateArgsTableRows';

describe('genearteArgsTableRows', () => {
  it('should generate the correct rows from a schema', () => {
    const schema = {
      primaryColor: {
        type: 'color',
        description: 'Primary color',
      },
      navigationBackgroundColor: {
        type: 'color',
        description: 'Navigation background color',
      },
      borderRadius: {
        type: 'length',
        description: 'Border radius',
      },
      textFontFamily: {
        type: 'font-family',
        description: 'font family for text',
      },
    };

    const rows = generateArgsTableRows(schema as any);

    expect(rows).toEqual({
      borderRadius: {
        control: { type: 'text' },
        description: 'Border radius',
        name: 'borderRadius',
        type: { name: 'string', required: true },
      },
      navigationBackgroundColor: {
        control: { type: 'color' },
        description: 'Navigation background color',
        name: 'navigationBackgroundColor',
        type: { name: 'string', required: true },
      },
      primaryColor: {
        control: { type: 'color' },
        description: 'Primary color',
        name: 'primaryColor',
        type: { name: 'string', required: true },
      },
      textFontFamily: {
        control: { type: 'text' },
        description: 'font family for text',
        name: 'textFontFamily',
        type: { name: 'string', required: true },
      },
    });
  });
});
