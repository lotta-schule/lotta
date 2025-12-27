import { render, waitFor } from 'test/util';
import { imageFile } from 'test/fixtures';
import { ResponsiveImage } from './ResponsiveImage';

import styles from './ResponsiveImage.module.scss';

describe('ResponsiveImage', () => {
  describe('should render a file', () => {
    it('should render the file without sizes property file', () => {
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
          class="_image_5s0fc_2 _loaded_5s0fc_8"
          srcset="https://example.com/123/preview_200 200w, https://example.com/123/preview_400 400w, https://example.com/123/preview_800 800w"
          style="border: 1px solid red;"
        />
      `);
    });

    it('should render the file with string sizes prop', () => {
      const screen = render(
        <ResponsiveImage
          file={imageFile}
          format="preview"
          sizes="(max-width: 1024px) 100vw, 50vw"
          alt="image"
        />
      );
      expect(screen.getByRole('img')).toMatchInlineSnapshot(`
        <img
          alt="image"
          class="_image_5s0fc_2 _loaded_5s0fc_8"
          sizes="(max-width: 1024px) 100vw, 50vw"
          srcset="https://example.com/123/preview_200 200w, https://example.com/123/preview_400 400w, https://example.com/123/preview_800 800w"
        />
      `);
    });

    it('should render the file with string[] sizes prop', () => {
      const screen = render(
        <ResponsiveImage
          file={imageFile}
          format="preview"
          sizes={['(max-width: 1024px) 100vw', '50vw']}
          alt="image"
        />
      );
      expect(screen.getByRole('img')).toMatchInlineSnapshot(`
        <img
          alt="image"
          class="_image_5s0fc_2 _loaded_5s0fc_8"
          sizes="(max-width: 1024px) 100vw, 50vw"
          srcset="https://example.com/123/preview_200 200w, https://example.com/123/preview_400 400w, https://example.com/123/preview_800 800w"
        />
      `);
    });

    it('should render the file with [number, number] sizes prop', () => {
      const screen = render(
        <ResponsiveImage
          file={imageFile}
          format="preview"
          sizes={[200, 400]}
          alt="image"
        />
      );
      expect(screen.getByRole('img')).toMatchInlineSnapshot(`
        <img
          alt="image"
          class="_image_5s0fc_2 _loaded_5s0fc_8"
          srcset="https://example.com/123/preview_200 1x,https://example.com/123/preview_400 2x"
        />
      `);
    });
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
        class="_image_5s0fc_2 _loaded_5s0fc_8"
        src="https://via.placeholder.com/300"
        style="border: 1px solid red;"
      />
    `);
  });

  it('should start without the loaded class and have it assigned later when animateOnLoad is set', async () => {
    const screen = render(
      <ResponsiveImage
        lazy
        animateOnLoad
        file={null}
        src={'https://via.placeholder.com/300'}
        format="preview"
        alt="Test"
        style={{ border: '1px solid red' }}
      />
    );
    expect(screen.getByRole('img')).toHaveClass(
      styles.lazy,
      styles.animateOnLoad
    );
    expect(screen.getByRole('img')).not.toHaveClass(styles.loaded);
    screen.getByRole('img').dispatchEvent(new Event('load'));
    await waitFor(() => {
      expect(screen.getByRole('img')).toHaveClass(styles.loaded);
    });
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
