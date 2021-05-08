import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import { Box } from '../component/general/layout/Box';
import { Page } from '../component/general/layout/Page';
import { Navigation } from '../component/general/navigation/Navigation';
import { NavigationButton } from 'component/general/button/NavigationButton';
import { Banner } from 'component/general/layout/Banner';
import { UserMenu } from 'component/general/navigation/UserMenu';
import { Favorite, CalendarToday, Fingerprint } from '@material-ui/icons';
import { Header } from 'component/general/layout/Header';
import { Button } from 'component/general/button/Button';

const loremIpsumContent = (
    <>
        <Box style={{ marginTop: '.5em' }}>
            <img src="https://picsum.photos/300/200" alt="" />
            <Box>
                <h2>Voll krasser Beitragstitel</h2>
                <div>Der Vorschautext vom Beitrag Voll krasser Beitrag.</div>
            </Box>
        </Box>
        <Box style={{ marginTop: '.5em' }}>
            <img src="https://picsum.photos/300/200" alt="" />
            <Box>
                <h2>Boxtitel</h2>
                <div>Boxinhalt</div>
            </Box>
        </Box>
        <Box style={{ marginTop: '.5em' }}>
            <img src="https://picsum.photos/300/200" alt="" />
            <Box>
                <h2>Boxtitel</h2>
                <div>Boxinhalt</div>
            </Box>
        </Box>
    </>
);

export default {
    title: 'Layout/Page',
    component: Page,
    argTypes: {},
} as Meta;

const Template: Story = ({ children, ...args }) => (
    <Page>
        <Header>
            <Box>
                <img src="https://picsum.photos/300/100" alt="" />
                <h2>Lotta Gesamtschule</h2>
            </Box>
        </Header>
        <Navigation
            primaryButtons={[
                <NavigationButton key={'start'}>Start</NavigationButton>,
                <NavigationButton key={'BLA'}>Bla</NavigationButton>,
                <NavigationButton key={'blub'}>Blub</NavigationButton>,
                <NavigationButton key={'aksdjf'}>Test</NavigationButton>,
            ]}
        />
        {children}
    </Page>
);

export const WithSidebar = Template.bind({});
WithSidebar.args = {
    children: (
        <>
            <main>
                <Banner>
                    <Box style={{ marginTop: '.5em' }}>
                        <Box>
                            <h1>Ich bin ein Banner.</h1>
                            <UserMenu />
                        </Box>
                    </Box>
                </Banner>
                {loremIpsumContent}
            </main>
            <aside>
                <Box style={{ marginTop: '.5em' }}>
                    <Navigation
                        primaryButtons={[
                            <Button icon={<Favorite />} />,
                            <Button icon={<CalendarToday />} />,
                            <Button icon={<Fingerprint />} />,
                        ]}
                    />
                    <div>Ich bin eine Seitenleiste</div>
                </Box>
            </aside>
        </>
    ),
};

export const SingleColumn = Template.bind({});
SingleColumn.args = {
    children: (
        <main>
            {' '}
            <Banner>
                <Box style={{ marginTop: '.5em' }}>
                    <h1>Ich bin ein Banner.</h1>
                    <UserMenu />
                </Box>
            </Banner>
            {loremIpsumContent}
        </main>
    ),
};
