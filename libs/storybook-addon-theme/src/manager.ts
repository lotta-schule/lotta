import { addons, types } from 'storybook/manager-api';
import { ADDON_ID, PANEL_ID } from './lib/constant';
import { Panel } from './lib/addon/Panel';

const addon = () => {
  // Register the tool
  // addons.add(TOOL_ID, {
  //   type: types.TOOL,
  //   title: "My addon",
  //   match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
  //   render: Tool,
  // });

  // Register the panel
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Theme Editor',
    match: () => true,
    render: Panel,
  });

  // Register the tab
  // addons.add(TAB_ID, {
  //   type: types.TAB,
  //   title: "My addon",
  //   //👇 Checks the current route for the story
  //   route: ({ storyId }) => `/myaddon/${storyId}`,
  //   //👇 Shows the Tab UI element in myaddon view mode
  //   match: ({ viewMode }) => viewMode === "myaddon",
  //   render: Tab,
  // });
};

addons.register(ADDON_ID, addon);

export default addon;
