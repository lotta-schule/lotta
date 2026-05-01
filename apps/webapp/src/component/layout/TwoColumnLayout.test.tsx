import { render } from '#/test/util.js';
import {
  TwoColumnLayout,
  TwoColumnLayoutContent,
  TwoColumnLayoutSidebar,
} from './TwoColumnLayout.js';

describe('TwoColumnLayout', () => {
  it('should render successfully', () => {
    const screen = render(
      <TwoColumnLayout>
        <TwoColumnLayoutSidebar>Sidebar</TwoColumnLayoutSidebar>
        <TwoColumnLayoutContent>Content</TwoColumnLayoutContent>
      </TwoColumnLayout>
    );

    expect(screen.container.firstChild).toMatchSnapshot();
  });
});
