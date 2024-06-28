import { render } from 'test/util';
import {
  TwoColumnLayout,
  TwoColumnLayoutContent,
  TwoColumnLayoutSidebar,
} from './TwoColumnLayout';

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
