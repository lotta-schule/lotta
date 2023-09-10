import { Collapse } from './Collapse';
import { render, waitFor } from '../test-utils';

const content = (
  <div>
    <p>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
      eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
      voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
      clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
      amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
      nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
      diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
      Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor
      sit amet.
    </p>
    <ul>
      <li>Vera; or, The Nihilists (1880) (text)</li>
      <li>The Duchess of Padua (1883) (text)</li>
      <li>Lady Windermere's Fan (1892) (text)</li>
      <li>A Woman of No Importance (1893) (text)</li>
      <li>An Ideal Husband (1895) (text)</li>
      <li>The Importance of Being Earnest (1895) (text)</li>
      <li>Salomé (1896) Translated from French by Lord Alfred Douglas</li>
      <li>La Sainte Courtisane (Incomplete) (text)</li>
      <li>A Florentine Tragedy (Incomplete) (text)</li>
    </ul>
  </div>
);

describe('util/Collapse', () => {
  it('should render the content', () => {
    const screen = render(<Collapse visible>{content}</Collapse>);
    expect(screen.getByRole('list')).toBeVisible();
  });

  it('should collapse the content', () => {
    const screen = render(<Collapse visible={false}>{content}</Collapse>);
    expect(screen.getByRole('list', { hidden: true })).not.toBeVisible();
  });

  it('should collapse the content', async () => {
    const screen = render(<Collapse visible={false}>{content}</Collapse>);
    await waitFor(() => {
      expect(screen.getByRole('list', { hidden: true })).not.toBeVisible();
    });
    screen.rerender(<Collapse visible={true}>{content}</Collapse>);
    await waitFor(() => {
      expect(screen.getByRole('list')).toBeVisible();
    });
  });
});
