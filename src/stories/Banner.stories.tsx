import React from "react";
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from "@storybook/react/types-6-0";

import { Banner } from "../component/general/layout/Banner";
import { Box } from "../component/general/layout/Box";
import { UserMenu } from "../component/general/navigation/UserMenu";

export default {
  title: "Layout/Banner",
  component: Banner,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <Banner {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: (
    <Box>
      <h1>Ich bin ein Banner.</h1>
      <UserMenu />
    </Box>
  ),
};
