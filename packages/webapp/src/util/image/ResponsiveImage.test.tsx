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
              srcset="https://via.placeholder.com/300?width=150&height=84&fn=cover 150w, https://via.placeholder.com/300?width=300&height=168&fn=cover 300w, https://via.placeholder.com/300?width=600&height=337&fn=cover 600w, https://via.placeholder.com/300?width=900&height=506&fn=cover 900w"
              style="border: 1px solid red;"
            />
        `);
  });
});
