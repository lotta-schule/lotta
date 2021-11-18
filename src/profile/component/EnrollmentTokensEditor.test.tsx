import React from 'react';
import { render, waitFor } from 'test/util';
import { EnrollmentTokensEditor } from './EnrollmentTokensEditor';
import userEvent from '@testing-library/user-event';

describe('shared/EnrollmentTokensEditor', () => {
    it('should render without crashing', () => {
        render(<EnrollmentTokensEditor tokens={[]} setTokens={() => {}} />);
    });

    it('show a list of tokens', () => {
        const screen = render(
            <EnrollmentTokensEditor
                tokens={['token1', 'token2', 'token3']}
                setTokens={() => {}}
            />
        );
        expect(screen.queryAllByRole('listitem')).toHaveLength(3);
        expect(
            screen.queryAllByRole('listitem').map((el) => el.textContent)
        ).toEqual(['token1', 'token2', 'token3']);
    });

    it('show the input as disabled when disabled prop is given', () => {
        const screen = render(
            <EnrollmentTokensEditor
                disabled
                tokens={['token1', 'token2', 'token3']}
                setTokens={() => {}}
            />
        );
        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    describe('adding an enrollment token', () => {
        it('should add an entered token and add it on ENTER', async () => {
            const onUpdate = jest.fn();
            const screen = render(
                <EnrollmentTokensEditor
                    tokens={['token1', 'token2', 'token3']}
                    setTokens={onUpdate}
                />
            );
            userEvent.type(screen.getByRole('textbox'), 'nexttoken{enter}');
            userEvent.tab();
            await waitFor(() => {
                expect(onUpdate).toHaveBeenCalledWith([
                    'token1',
                    'token2',
                    'token3',
                    'nexttoken',
                ]);
            });
            screen.rerender(
                <EnrollmentTokensEditor
                    tokens={['token1', 'token2', 'token3', 'nexttoken']}
                    setTokens={onUpdate}
                />
            );
            expect(screen.getByRole('textbox')).toHaveValue('');
        });

        it('should add an entered token and add it on ","', async () => {
            const onUpdate = jest.fn();
            const screen = render(
                <EnrollmentTokensEditor
                    tokens={['token1', 'token2', 'token3']}
                    setTokens={onUpdate}
                />
            );
            userEvent.type(screen.getByRole('textbox'), 'nexttoken,');
            await waitFor(() => {
                expect(onUpdate).toHaveBeenCalledWith([
                    'token1',
                    'token2',
                    'token3',
                    'nexttoken',
                ]);
            });
            expect(screen.getByRole('textbox')).toHaveValue('');
        });

        it('should add an entered token and add it on " "', async () => {
            const onUpdate = jest.fn();
            const screen = render(
                <EnrollmentTokensEditor
                    tokens={['token1', 'token2', 'token3']}
                    setTokens={onUpdate}
                />
            );
            userEvent.type(screen.getByRole('textbox'), 'nexttoken ');
            await waitFor(() => {
                expect(onUpdate).toHaveBeenCalledWith([
                    'token1',
                    'token2',
                    'token3',
                    'nexttoken',
                ]);
            });
            expect(screen.getByRole('textbox')).toHaveValue('');
        });
    });
});
