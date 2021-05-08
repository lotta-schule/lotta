import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import { UserMenu, UserMenuProps } from '../component/general/navigation/UserMenu';
import { SomeUser } from 'test/fixtures';

export default {
    title: 'UserMenu/Main',
    component: UserMenu,
    argTypes: {
    },
  } as Meta;
  
  const Template: Story<UserMenuProps> = (args) => <UserMenu {...args} />;
  
  export const LoggedIn = Template.bind({});
  LoggedIn.args = {
    user: SomeUser
  };

  export const NotLoggedIn = Template.bind({});
  NotLoggedIn.args = {
  };
