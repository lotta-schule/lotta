import { render } from '@testing-library/react';
import { FullErrorPage, SecondaryErrorText } from './FullErrorPage';

describe('FullErrorPage', () => {
  it('renders the title correctly', () => {
    const screen = render(
      <FullErrorPage title="Error Title">Some error occurred</FullErrorPage>
    );

    const titleElement = screen.getByRole('heading', { level: 1 });
    expect(titleElement).toHaveTextContent('Error Title');

    const childrenElement = screen.getByText('Some error occurred');
    expect(childrenElement).toBeInTheDocument();
  });

  it('renders the image when imageUrl is provided', () => {
    const imageUrl = 'https://example.com/error-image.png';
    const screen = render(
      <FullErrorPage title="Error Title" imageUrl={imageUrl}>
        Some error occurred
      </FullErrorPage>
    );

    const imageElement = screen.getByRole('presentation');
    expect(imageElement).toHaveAttribute('src', imageUrl);
    expect(imageElement).toHaveAttribute('alt', 'Diese Seite existiert nicht');
  });

  it('does not render the image when imageUrl is not provided', () => {
    const screen = render(
      <FullErrorPage title="Error Title">Some error occurred</FullErrorPage>
    );

    const imageElement = screen.queryByRole('presentation');
    expect(imageElement).not.toBeInTheDocument();
  });

  it('renders the subtitle when provided', () => {
    const screen = render(
      <FullErrorPage title="Error Title" subtitle="Error Subtitle">
        Some error occurred
      </FullErrorPage>
    );

    const titleElement = screen.getByRole('heading', { level: 1 });
    expect(titleElement).toHaveTextContent('Error Title');
    expect(titleElement).toHaveTextContent('Error Subtitle');
  });

  it('does not render subtitle when not provided', () => {
    const screen = render(
      <FullErrorPage title="Error Title">Some error occurred</FullErrorPage>
    );

    const titleElement = screen.getByRole('heading', { level: 1 });
    expect(titleElement).toHaveTextContent('Error Title');
    expect(titleElement).not.toHaveTextContent(':');
  });
});

describe('SecondaryErrorText', () => {
  it('renders the secondary error text correctly', () => {
    const screen = render(
      <SecondaryErrorText>Secondary error message</SecondaryErrorText>
    );

    const secondaryTextElement = screen.getByText('Secondary error message');
    expect(secondaryTextElement).toBeInTheDocument();
  });
});
