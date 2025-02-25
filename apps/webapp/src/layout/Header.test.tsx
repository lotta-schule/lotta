import { render } from 'test/util';
import { Header } from './Header';
import { imageFile } from 'test/fixtures';

describe('Header', () => {
  it('renders the header content correctly', () => {
    const screen = render(<Header>Test Header Content</Header>);

    const headerElement = screen.getByTestId('Header');
    expect(headerElement).toBeInTheDocument();

    const childrenContent = screen.getByText('Test Header Content');
    expect(childrenContent).toBeInTheDocument();
  });

  it('renders the banner image when bannerImage is provided', () => {
    const screen = render(
      <Header bannerImage={imageFile}>Test Header Content</Header>
    );

    const imageElement = screen.getByRole('presentation');
    expect(imageElement).toBeInTheDocument();
    expect(imageElement.getAttribute('srcset')).toContain('/banner_660.webp');
  });

  it('renders the banner image when bannerImageUrl is provided', () => {
    const bannerImageUrl = 'https://example.com/banner.jpg';
    const screen = render(
      <Header bannerImageUrl={bannerImageUrl}>Test Header Content</Header>
    );

    const imageElement = screen.getByRole('presentation');
    expect(imageElement).toBeInTheDocument();
    expect(imageElement.getAttribute('src')).toEqual(bannerImageUrl);
  });
});
