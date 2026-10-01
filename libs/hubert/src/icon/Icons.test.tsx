import { render } from '../test-utils';
import * as Icons from './index';

describe('Icon Components', () => {
  Object.entries(Icons).forEach(([iconName, IconComponent]) => {
    it(`should render ${iconName} without crashing`, () => {
      expect(() => render(<IconComponent />)).not.toThrow();
    });

    it(`should render ${iconName} with custom className`, () => {
      const { container } = render(<IconComponent className="custom-class" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('custom-class');
    });

    it(`should render ${iconName} with data-testid`, () => {
      const { container } = render(<IconComponent />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('data-testid');
    });
  });
});
