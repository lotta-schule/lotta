import { render } from 'test-utils';
import { FileIcon } from './FileIcon';

describe('browser/FileIcon', () => {
  it('should render the correct icon for a pdf file', () => {
    const screen = render(<FileIcon mimeType="application/pdf" />);
    expect(screen.getByTestId('file-pdf-icon')).toBeInTheDocument();
  });

  it('should render the correct icon for a doc file', () => {
    const screen = render(
      <FileIcon mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
    );
    expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
  });

  it('should render the correct icon for an xls file', () => {
    const screen = render(
      <FileIcon mimeType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
    );
    expect(screen.getByTestId('file-table-icon')).toBeInTheDocument();
  });

  it('should render the correct icon for a ppt file', () => {
    const screen = render(
      <FileIcon mimeType="application/vnd.openxmlformats-officedocument.presentationml.presentation" />
    );
    expect(screen.getByTestId('file-powerpoint-icon')).toBeInTheDocument();
  });

  it('should render the correct icon for an archive file', () => {
    const screen = render(<FileIcon mimeType="application/zip" />);
    expect(screen.getByTestId('file-archive-icon')).toBeInTheDocument();
  });

  it('should render the correct icon for an image file', () => {
    const screen = render(<FileIcon mimeType="image/jpeg" />);
    expect(screen.getByTestId('file-image-icon')).toBeInTheDocument();
  });

  it('should render the correct icon for a audio file', () => {
    const screen = render(<FileIcon mimeType="audio/mp3" />);
    expect(screen.getByTestId('file-audio-icon')).toBeInTheDocument();
  });

  it('should render the correct icon for an video file', () => {
    const screen = render(<FileIcon mimeType="video/webm" />);
    expect(screen.getByTestId('file-video-icon')).toBeInTheDocument();
  });

  it('should fallback to the generic file icon', () => {
    const screen = render(<FileIcon mimeType="iamsomunknownformat" />);
    expect(screen.getByTestId('file-icon')).toBeInTheDocument();
  });
});
