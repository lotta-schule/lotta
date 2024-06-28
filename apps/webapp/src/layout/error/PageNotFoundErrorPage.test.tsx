import { render } from '@testing-library/react';
import { PageNotFoundErrorPage } from './PageNotFoundErrorPage';

describe('PageNotFoundErrorPage', () => {
  it('should render the PageNotFoundErrorPage component', () => {
    const screen = render(<PageNotFoundErrorPage />);
    expect(screen.container).toMatchSnapshot();
  });
});
