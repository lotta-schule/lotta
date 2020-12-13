import React from 'react';
import { render } from 'test/util';
import { SomeUser, SomeUserin, getSomeMessages } from 'test/fixtures';
import { MessageBubble } from './MessageBubble';

const message = { ...getSomeMessages(SomeUser, { to_user: SomeUserin })[0], content: 'Hallo!' };

describe('component/layouts/messagingLayout/MessageBubble', () => {

    it('should render the component', () => {
        render(<MessageBubble message={message} />);
    });

    it('should render show the message and sender name', () => {
        const screen = render(<MessageBubble message={message} />);
        expect(screen.getByText('Hallo!')).toBeVisible();
        expect(screen.getByText('Ernesto Guevara')).toBeVisible();
    });

});
