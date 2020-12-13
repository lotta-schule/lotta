import React from 'react';
import { render, waitFor } from 'test/util';
import { SomeUser, SomeUserin } from 'test/fixtures';
import { MessageToolbar } from './MessageToolbar';
import { ChatType } from 'model';
import { SearchUsersQuery } from 'api/query/SearchUsersQuery';
import userEvent from '@testing-library/user-event';

describe('component/layouts/adminLayout/MessageToolbar', () => {

    it('should render without error', () => {
        render(
            <MessageToolbar onCreateMessageThread={() => {}} />,
            {}, { useCache: true, currentUser: SomeUser }
        );
    });

    it('should open the create popup when clicking on the "add" button', () => {
        const screen =
            render(
                <MessageToolbar onCreateMessageThread={() => {}} />,
                {}, { useCache: true, currentUser: SomeUser }
            );

        userEvent.click(screen.getByRole('button', { name: /nachricht schreiben/i }));
        expect(screen.getByRole('presentation', { name: /empfänger wählen/i })).toBeVisible();
    });

    it('should select a user and create the corresponding thread object', async () => {
        const additionalMocks = [{
            request: { query: SearchUsersQuery, variables: { searchtext: 'Drinalda' } },
            result: { data: { users: [SomeUser, SomeUserin] } }
        }];
        const onCreateMessageThread = jest.fn(({ messageType, counterpart, date }) => {
            expect(messageType).toEqual(ChatType.DirectMessage);
            expect(counterpart.name).toEqual('Luisa Drinalda');
            expect(date).toBeInstanceOf(Date);
        });
        const screen =
            render(
                <MessageToolbar onCreateMessageThread={onCreateMessageThread} />,
                {}, { useCache: true, currentUser: SomeUser, additionalMocks }
            );

        userEvent.click(screen.getByRole('button', { name: /nachricht schreiben/i }));

        userEvent.click(screen.getByRole('tab', { name: /nutzer/i }));
        userEvent.type(screen.getByRole('textbox', { name: /nutzer suchen/i }), 'Drinalda');
        await waitFor(() => {
            expect(screen.getByRole('option', { name: /drinalda/i })).toBeVisible();
        });
        userEvent.click(screen.getByRole('option', { name: /drinalda/i }));
        expect(onCreateMessageThread).toHaveBeenCalled();
    });

    it('should select a group and create the corresponding thread object', () => {
        const onCreateMessageThread = jest.fn(({ messageType, counterpart, date }) => {
            expect(messageType).toEqual(ChatType.GroupChat);
            expect(counterpart.name).toEqual('Schüler');
            expect(date).toBeInstanceOf(Date);
        });
        const screen =
            render(
                <MessageToolbar onCreateMessageThread={onCreateMessageThread} />,
                {}, { useCache: true, currentUser: SomeUser }
            );

        userEvent.click(screen.getByRole('button', { name: /nachricht schreiben/i }));

        userEvent.click(screen.getByRole('tab', { name: /gruppe/i }));
        userEvent.click(screen.getByPlaceholderText(/gruppe suchen/i));
        expect(screen.getByRole('option', { name: 'Schüler' })).toBeVisible();
        userEvent.click(screen.getByRole('option', { name: 'Schüler' }));
        expect(onCreateMessageThread).toHaveBeenCalled();
    });

});
