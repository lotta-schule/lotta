import { render } from 'test/util';
import { imageFile } from 'test/fixtures';
import { ResponsiveImage } from './ResponsiveImage';

describe('ResponsiveImage', () => {
  it('should render a file', () => {
    const screen = render(
      <ResponsiveImage
        file={imageFile}
        format="preview"
        alt="Test"
        style={{ border: '1px solid red' }}
      />
    );
    expect(screen.getByRole('img')).toMatchInlineSnapshot(`
      <img
        alt="Test"
        srcset="https://example.com/123/preview_200.webp 200w, https://example.com/123/preview_400.webp 400w, https://example.com/123/preview_800.webp 800w, https://example.com/123/preview_1200.webp 1200w, https://example.com/123/preview_1600.webp 1600w, https://example.com/123/preview_2400.webp 2400w, https://example.com/123/preview_3200.webp 3200w"
        style="border: 1px solid red;"
      />
    `);
  });

  it('should render an explicit src', () => {
    const screen = render(
      <ResponsiveImage
        file={null}
        src="https://via.placeholder.com/300"
        format="preview"
        alt="Test"
        style={{ border: '1px solid red' }}
      />
    );
    expect(screen.getByRole('img')).toMatchInlineSnapshot(`
      <img
        alt="Test"
        src="https://via.placeholder.com/300"
        style="border: 1px solid red;"
      />
    `);
  });

  it('should render a fallback if the file has no formats', () => {
    const screen = render(
      <ResponsiveImage
        file={{ ...imageFile, formats: [] }}
        format="preview"
        alt="Test"
        style={{ border: '1px solid red' }}
        fallback={<div>Test</div>}
      />
    );
    expect(screen.getByText('Test')).toBeVisible();
  });
});
