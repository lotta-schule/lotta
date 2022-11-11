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
              src="https://test.cloudimg.io/v7/via.placeholder.com/300?sharp=1&width=300&func=cover&gravity=auto&aspect_ratio=16%3A9"
              srcset="https://test.cloudimg.io/v7/via.placeholder.com/300?sharp=1&width=300&func=cover&gravity=auto&aspect_ratio=16%3A9 300w, https://test.cloudimg.io/v7/via.placeholder.com/300?sharp=1&width=500&func=cover&gravity=auto&aspect_ratio=16%3A9 500w"
              style="border: 1px solid red;"
            />
        `);
    });
});
