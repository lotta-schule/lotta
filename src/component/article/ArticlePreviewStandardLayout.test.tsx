import * as React from 'react';
import { render, waitFor } from 'test/util';
import {
    adminGroup,
    imageFile,
    KeinErSieEsUser,
    SomeUser,
    SomeUserin,
    Weihnachtsmarkt,
} from 'test/fixtures';
import { ArticlePreviewStandardLayout } from './ArticlePreviewStandardLayout';
import userEvent from '@testing-library/user-event';

describe('component/article/ArticlePreviewStandardLayout', () => {
    it('should render an ArticlePreview without error', () => {
        render(
            <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
            {},
            { currentUser: SomeUser }
        );
    });

    describe('should render title', () => {
        it('as heading when disableLink prop is set', () => {
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={Weihnachtsmarkt}
                    disableLink
                />,
                {},
                { currentUser: SomeUser }
            );
            expect(
                screen.getByRole('heading', { name: /article title/i })
            ).toBeVisible();
            expect(
                screen.getByRole('heading', { name: /article title/i })
            ).toHaveTextContent('Weihnachtsmarkt');
            expect(
                screen.queryByRole('link', { name: /weihnachtsmarkt/i })
            ).toBeNull();
        });

        it('as link when disableLink prop is not set', () => {
            const screen = render(
                <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
                {},
                { currentUser: SomeUser }
            );
            expect(
                screen.getByRole('heading', { name: /article title/i })
            ).toBeVisible();
            expect(
                screen.getByRole('heading', { name: /article title/i })
            ).toHaveTextContent('Weihnachtsmarkt');
            expect(
                screen.getByRole('link', { name: /weihnachtsmarkt/i })
            ).toBeVisible();
        });

        it('as editable when onUpdateArticle prop is given', () => {
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={Weihnachtsmarkt}
                    onUpdateArticle={jest.fn()}
                />,
                {},
                { currentUser: SomeUser }
            );
            expect(
                screen.getByRole('textbox', { name: /article title/i })
            ).toBeVisible();
            expect(
                screen.getByRole('textbox', { name: /article title/i })
            ).toHaveValue('Weihnachtsmarkt');
        });

        it('and call update callback when edited', () => {
            const fn = jest.fn();
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={Weihnachtsmarkt}
                    onUpdateArticle={fn}
                />,
                {},
                { currentUser: SomeUser }
            );
            userEvent.type(
                screen.getByRole('textbox', { name: /article title/i }),
                '{selectall}A'
            );
            expect(fn).toHaveBeenCalledWith({ ...Weihnachtsmarkt, title: 'A' });
        });
    });

    describe('Article Preview field', () => {
        it('should render preview', () => {
            const screen = render(
                <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
                {},
                { currentUser: SomeUser }
            );
            expect(
                screen.getByText(
                    'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.'
                )
            ).toBeVisible();
        });

        it('as editable when onUpdateArticle prop is given', () => {
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={Weihnachtsmarkt}
                    onUpdateArticle={jest.fn()}
                />,
                {},
                { currentUser: SomeUser }
            );
            expect(
                screen.getByRole('textbox', { name: /article preview text/i })
            ).toBeVisible();
            expect(
                screen.getByRole('textbox', { name: /article preview text/i })
            ).toHaveValue(
                'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.'
            );
        });

        it('and call update callback when edited', () => {
            const fn = jest.fn();
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={Weihnachtsmarkt}
                    onUpdateArticle={fn}
                />,
                {},
                { currentUser: SomeUser }
            );
            userEvent.type(
                screen.getByRole('textbox', { name: /article preview text/i }),
                '{selectall}A'
            );
            expect(fn).toHaveBeenCalledWith({
                ...Weihnachtsmarkt,
                preview: 'A',
            });
        });
    });

    describe('preview image', () => {
        it('should not render if not available when not in EditMode', () => {
            const screen = render(
                <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
                {},
                { currentUser: SomeUser }
            );
            expect(
                screen.queryByRole('img', { name: /vorschaubild/i })
            ).toBeNull();
        });

        it('should render if available', () => {
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={{
                        ...Weihnachtsmarkt,
                        previewImageFile: imageFile as any,
                    }}
                />,
                {},
                { currentUser: SomeUser }
            );
            expect(
                screen.getByRole('img', { name: /vorschaubild/i })
            ).toBeVisible();
            expect(
                screen.getByRole('img', { name: /vorschaubild/i })
            ).toHaveAttribute('src', expect.stringContaining('/storage/f/123'));
        });

        describe('EditMode', () => {
            it('as editable when onUpdateArticle prop is given', () => {
                const screen = render(
                    <ArticlePreviewStandardLayout
                        article={Weihnachtsmarkt}
                        onUpdateArticle={jest.fn()}
                    />,
                    {},
                    { currentUser: SomeUser }
                );
                expect(screen.getByTestId('EditOverlay')).toBeVisible();
            });
        });
    });

    describe('tags', () => {
        it('should render tags', () => {
            const screen = render(
                <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
                {},
                { currentUser: SomeUser }
            );
            expect(screen.getByTestId('Tag')).toHaveTextContent(
                'La Revolucion'
            );
        });

        it('should not show DeleteButton when in EditMode', () => {
            const screen = render(
                <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
                {},
                { currentUser: SomeUser }
            );
            const tag = screen.getByTestId('Tag');
            expect(
                tag.querySelector('[data-testid="DeleteButton"]')
            ).toBeNull();
        });

        it('should show DeleteButton when in EditMode', () => {
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={Weihnachtsmarkt}
                    onUpdateArticle={jest.fn()}
                />,
                {},
                { currentUser: SomeUser }
            );
            const tag = screen.getByTestId('Tag');
            expect(tag.querySelector('svg')).toBeVisible();
        });

        it('should delete the tag when DeleteButton is clicked', () => {
            const fn = jest.fn();
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={Weihnachtsmarkt}
                    onUpdateArticle={fn}
                />,
                {},
                { currentUser: SomeUser }
            );
            const tag = screen.getByTestId('Tag');
            userEvent.click(tag.querySelector('svg')!);
            expect(fn).toHaveBeenCalledWith({
                ...Weihnachtsmarkt,
                tags: [],
            });
        });

        it('should add a new tag', async () => {
            const fn = jest.fn();
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={Weihnachtsmarkt}
                    onUpdateArticle={fn}
                />,
                {},
                { currentUser: SomeUser }
            );
            userEvent.type(
                screen.getByRole('textbox', { name: /tag hinzufügen/i }),
                'Neu{enter}'
            );
            await waitFor(() => {
                expect(fn).toHaveBeenCalledWith({
                    ...Weihnachtsmarkt,
                    tags: ['La Revolucion', 'Neu'],
                });
            });
        });
    });

    describe('UpdateTime', () => {
        it('should render last update time', () => {
            const screen = render(
                <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
                {},
                { currentUser: SomeUser }
            );
            expect(screen.getByText('11.10.2020')).toBeVisible();
        });
    });

    describe('Users List', () => {
        const WeihnachtsmarktWithUsers = {
            ...Weihnachtsmarkt,
            users: [SomeUser, SomeUserin],
        };
        it('should render the users list', () => {
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={WeihnachtsmarktWithUsers}
                />,
                {},
                { currentUser: SomeUser }
            );
            expect(screen.getByTestId('AuthorAvatarsList')).toBeVisible();
            expect(
                screen.getAllByRole('img', { name: /profilbild/i })
            ).toHaveLength(2);
        });

        describe('EditMode', () => {
            it('should show the "add author" input field when in EditMode', () => {
                const screen = render(
                    <ArticlePreviewStandardLayout
                        article={WeihnachtsmarktWithUsers}
                        onUpdateArticle={jest.fn()}
                    />,
                    {},
                    { currentUser: SomeUser }
                );
                expect(
                    screen.getByRole('textbox', { name: /autor hinzufügen/i })
                ).toBeVisible();
            });

            it('should show the "delete" button for authors when in EditMode', () => {
                const fn = jest.fn();
                const screen = render(
                    <ArticlePreviewStandardLayout
                        article={WeihnachtsmarktWithUsers}
                        onUpdateArticle={fn}
                    />,
                    {},
                    { currentUser: KeinErSieEsUser }
                );
                const avatarsList = screen.getByTestId('AuthorAvatarsList');
                expect(avatarsList.querySelector('button')).toBeVisible();
                userEvent.click(avatarsList.querySelector('button')!);
                expect(fn).toHaveBeenCalledWith({
                    ...WeihnachtsmarktWithUsers,
                    users: [SomeUserin],
                });
            });
            describe('should show warning when removing oneself', () => {
                it('show a warning when user tries to remove him/herself and close the popup on abort', async () => {
                    const onUpdate = jest.fn();
                    const screen = render(
                        <ArticlePreviewStandardLayout
                            article={WeihnachtsmarktWithUsers}
                            onUpdateArticle={onUpdate}
                        />,
                        {},
                        { currentUser: SomeUser }
                    );
                    userEvent.click(
                        screen.getByRole('button', { name: /che entfernen/i })
                    );
                    await waitFor(() => {
                        expect(screen.getByRole('dialog')).toBeVisible();
                    });
                    expect(
                        screen.getByRole('dialog').querySelectorAll('button')
                    ).toHaveLength(2);
                    expect(
                        screen.getByRole('dialog').querySelectorAll('button')[0]
                    ).toHaveTextContent(/abbrechen/i);
                    userEvent.click(
                        screen.getByRole('dialog').querySelectorAll('button')[0]
                    );
                    await waitFor(() => {
                        expect(screen.queryByRole('dialog')).toBeNull();
                    });
                });

                it('show a warning when user tries to remove him/herself and remove user on confirm', async () => {
                    const onUpdate = jest.fn();
                    const screen = render(
                        <ArticlePreviewStandardLayout
                            article={WeihnachtsmarktWithUsers}
                            onUpdateArticle={onUpdate}
                        />,
                        {},
                        { currentUser: SomeUser }
                    );
                    userEvent.click(
                        screen.getByRole('button', { name: /che entfernen/i })
                    );
                    await waitFor(() => {
                        expect(screen.getByRole('dialog')).toBeVisible();
                    });
                    expect(
                        screen.getByRole('dialog').querySelectorAll('button')
                    ).toHaveLength(2);
                    expect(
                        screen.getByRole('dialog').querySelectorAll('button')[1]
                    ).toHaveTextContent(/entfernen/i);
                    userEvent.click(
                        screen.getByRole('dialog').querySelectorAll('button')[1]
                    );

                    expect(onUpdate).toHaveBeenCalledWith({
                        ...WeihnachtsmarktWithUsers,
                        users: [SomeUserin],
                    });
                });
            });
        });
    });

    describe('Edit Button', () => {
        const admin = { ...SomeUser, groups: [adminGroup] };

        it('should be shown for admin', () => {
            const screen = render(
                <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
                {},
                { currentUser: admin }
            );
            expect(
                screen.queryByRole('button', { name: /beitrag bearbeiten/i })
            ).toBeVisible();
        });

        it('should not be shown for admin if disableEdit is set', () => {
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={Weihnachtsmarkt}
                    disableEdit
                />,
                {},
                { currentUser: admin }
            );
            expect(
                screen.queryByRole('button', { name: /beitrag bearbeiten/i })
            ).toBeNull();
        });

        it('should be shown for author', () => {
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={{ ...Weihnachtsmarkt, users: [SomeUser] }}
                />,
                {},
                { currentUser: SomeUser }
            );
            expect(
                screen.queryByRole('button', { name: /beitrag bearbeiten/i })
            ).toBeVisible();
        });

        it('should not be shown for author if disableEdit is set', () => {
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={{ ...Weihnachtsmarkt, users: [SomeUser] }}
                    disableEdit
                />,
                {},
                { currentUser: SomeUser }
            );
            expect(
                screen.queryByRole('button', { name: /beitrag bearbeiten/i })
            ).toBeNull();
        });

        it('should not be shown for other user', () => {
            const screen = render(
                <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
                {},
                { currentUser: SomeUser }
            );
            expect(
                screen.queryByRole('button', { name: /beitrag bearbeiten/i })
            ).toBeNull();
        });

        it('should not be shown for other user if disableEdit is set', () => {
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={Weihnachtsmarkt}
                    disableEdit
                />,
                {},
                { currentUser: SomeUser }
            );
            expect(
                screen.queryByRole('button', { name: /beitrag bearbeiten/i })
            ).toBeNull();
        });
    });

    describe('Pin Button', () => {
        const admin = { ...SomeUser, groups: [adminGroup] };

        it('should be shown for admin', () => {
            const screen = render(
                <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
                {},
                { currentUser: admin }
            );
            expect(
                screen.queryByRole('button', { name: /beitrag .+ anpinnen/i })
            ).toBeVisible();
        });

        it('should not be shown for admin if disablePin is set', () => {
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={Weihnachtsmarkt}
                    disablePin
                />,
                {},
                { currentUser: admin }
            );
            expect(
                screen.queryByRole('button', { name: /beitrag .+ anpinnen/i })
            ).toBeNull();
        });

        it('should not be shown for author', () => {
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={{ ...Weihnachtsmarkt, users: [SomeUser] }}
                />,
                {},
                { currentUser: SomeUser }
            );
            expect(
                screen.queryByRole('button', { name: /beitrag .+ anpinnen/i })
            ).toBeNull();
        });

        it('should not be shown for author if disablePin is set', () => {
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={{ ...Weihnachtsmarkt, users: [SomeUser] }}
                    disablePin
                />,
                {},
                { currentUser: SomeUser }
            );
            expect(
                screen.queryByRole('button', { name: /beitrag .+ anpinnen/i })
            ).toBeNull();
        });

        it('should not be shown for other user', () => {
            const screen = render(
                <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
                {},
                { currentUser: SomeUser }
            );
            expect(
                screen.queryByRole('button', { name: /beitrag .+ anpinnen/i })
            ).toBeNull();
        });

        it('should not be shown for other user if disablePin is set', () => {
            const screen = render(
                <ArticlePreviewStandardLayout
                    article={Weihnachtsmarkt}
                    disablePin
                />,
                {},
                { currentUser: SomeUser }
            );
            expect(
                screen.queryByRole('button', { name: /beitrag .+ anpinnen/i })
            ).toBeNull();
        });
    });
});
