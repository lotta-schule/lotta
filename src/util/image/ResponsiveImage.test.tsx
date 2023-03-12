jest.mock('next/config', () => () => ({
    publicRuntimeConfig: {
        cloudimageToken: 'test',
    },
}));

import { render } from 'test/util';
import { ResponsiveImage } from './ResponsiveImage';

describe('ResponsiveImage', () => {
    it('should render', () => {
        const { getByRole } = render(
            <ResponsiveImage
                src="https://via.placeholder.com/300"
                alt="Test"
                width={300}
                style={{ border: '1px solid red' }}
                sizes="(max-width: 600px) 100vw, 600px"
                aspectRatio="16:9"
            />
        );
        expect(getByRole('img')).toMatchInlineSnapshot(`
            <img
              alt="Test"
              sizes="(max-width: 600px) 100vw, 600px"
              src="https://via.placeholder.com/300?width=300&height=168&fn=cover"
              srcset="https://via.placeholder.com/300?width=300&height=168&fn=cover 300w, https://via.placeholder.com/300?width=500&height=281&fn=cover 500w"
              style="border: 1px solid red;"
            />
        `);
    });
});
