import { ContentModuleType } from 'model';
import { render, userEvent } from 'test/util';
import { SomeUser } from 'test/fixtures';
import { AddModuleBar } from './AddModuleBar';

describe('AddModuleBar', () => {
  const currentUser = SomeUser;
  it('should add a title module', async () => {
    const fireEvent = userEvent.setup();
    const onAddModule = vi.fn(({ type }) => {
      expect(type).toEqual(ContentModuleType.TITLE);
    });
    const screen = render(
      <AddModuleBar onAddModule={onAddModule} />,
      {},
      { currentUser }
    );
    await fireEvent.click(screen.getByRole('button', { name: /titel/i }));
    expect(onAddModule).toHaveBeenCalled();
  });

  it('should add a download module', async () => {
    const fireEvent = userEvent.setup();
    const onAddModule = vi.fn(({ type }) => {
      expect(type).toEqual(ContentModuleType.DOWNLOAD);
    });
    const screen = render(
      <AddModuleBar onAddModule={onAddModule} />,
      {},
      { currentUser }
    );
    await fireEvent.click(screen.getByRole('button', { name: /dateien/i }));
    expect(onAddModule).toHaveBeenCalled();
  });

  it('should add a divider module', async () => {
    const fireEvent = userEvent.setup();
    const onAddModule = vi.fn(({ type }) => {
      expect(type).toEqual(ContentModuleType.DIVIDER);
    });
    const screen = render(
      <AddModuleBar onAddModule={onAddModule} />,
      {},
      { currentUser }
    );
    await fireEvent.click(screen.getByRole('button', { name: /trennlinie/i }));
    expect(onAddModule).toHaveBeenCalled();
  });

  it('should add a form module', async () => {
    const fireEvent = userEvent.setup();
    const onAddModule = vi.fn(({ type }) => {
      expect(type).toEqual(ContentModuleType.FORM);
    });
    const screen = render(
      <AddModuleBar onAddModule={onAddModule} />,
      {},
      { currentUser }
    );
    await fireEvent.click(screen.getByRole('button', { name: /formular/i }));
    expect(onAddModule).toHaveBeenCalled();
  });

  it('should add a table module', async () => {
    const fireEvent = userEvent.setup();
    const onAddModule = vi.fn(({ type }) => {
      expect(type).toEqual(ContentModuleType.TABLE);
    });
    const screen = render(
      <AddModuleBar onAddModule={onAddModule} />,
      {},
      { currentUser }
    );
    await fireEvent.click(screen.getByRole('button', { name: /tabelle/i }));
    expect(onAddModule).toHaveBeenCalled();
  });

  it('should add an image module', async () => {
    const fireEvent = userEvent.setup();
    const onAddModule = vi.fn(({ type }) => {
      expect(type).toEqual(ContentModuleType.IMAGE);
    });
    const screen = render(
      <AddModuleBar onAddModule={onAddModule} />,
      {},
      { currentUser }
    );
    await fireEvent.click(screen.getByRole('button', { name: /bild/i }));
    expect(onAddModule).toHaveBeenCalled();
  });

  it('should add a gallery module', async () => {
    const fireEvent = userEvent.setup();
    const onAddModule = vi.fn(({ type }) => {
      expect(type).toEqual(ContentModuleType.IMAGE_COLLECTION);
    });
    const screen = render(
      <AddModuleBar onAddModule={onAddModule} />,
      {},
      { currentUser }
    );
    await fireEvent.click(screen.getByRole('button', { name: /galerie/i }));
    expect(onAddModule).toHaveBeenCalled();
  });

  it('should add a video module', async () => {
    const fireEvent = userEvent.setup();
    const onAddModule = vi.fn(({ type }) => {
      expect(type).toEqual(ContentModuleType.VIDEO);
    });
    const screen = render(
      <AddModuleBar onAddModule={onAddModule} />,
      {},
      { currentUser }
    );
    await fireEvent.click(screen.getByRole('button', { name: /video/i }));
    expect(onAddModule).toHaveBeenCalled();
  });

  it('should add an audio module', async () => {
    const fireEvent = userEvent.setup();
    const onAddModule = vi.fn(({ type }) => {
      expect(type).toEqual(ContentModuleType.AUDIO);
    });
    const screen = render(
      <AddModuleBar onAddModule={onAddModule} />,
      {},
      { currentUser }
    );
    await fireEvent.click(screen.getByRole('button', { name: /audio/i }));
    expect(onAddModule).toHaveBeenCalled();
  });
});
