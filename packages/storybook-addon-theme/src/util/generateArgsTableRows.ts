import { schema as themeSchema } from '@lotta-schule/theme';

export const generateArgsTableRows = (schema: typeof themeSchema) => {
  return Object.entries(schema).reduce(
    (acc, [property, { description, type }]) => ({
      ...acc,
      [property]: {
        name: property,
        description,
        type: {
          name: 'string',
          required: true,
        },
        control: (() => {
          switch (type) {
            case 'color':
              return { type: 'color' };
            case 'font-family':
              return { type: 'text' };
            default:
              return { type: 'text' };
          }
        })(),
      },
    }),
    {}
  );
};
