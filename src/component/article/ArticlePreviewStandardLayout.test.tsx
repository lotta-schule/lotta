import * as React from 'react';
import { render } from 'test/util';
import {
    adminGroup,
    imageFile,
    SomeUser,
    Weihnachtsmarkt,
} from 'test/fixtures';
import { ArticlePreviewStandardLayout } from './ArticlePreviewStandardLayout';

describe('component/article/ArticlePreviewStandardLayout', () => {
    it('should render an ArticlePreview without error', () => {
        render(
            <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
            {},
            { currentUser: SomeUser, useCache: true }
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
                { currentUser: SomeUser, useCache: true }
            );
            expect(
                screen.getByRole('heading', { name: /weihnachtsmarkt/i })
            ).toBeVisible();
            expect(
                screen.queryByRole('link', { name: /weihnachtsmarkt/i })
            ).toBeNull();
        });

        it('as link when disableLink prop is not set', () => {
            const screen = render(
                <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
                {},
                { currentUser: SomeUser, useCache: true }
            );
            expect(
                screen.getByRole('heading', { name: /weihnachtsmarkt/i })
            ).toBeVisible();
            expect(
                screen.getByRole('link', { name: /weihnachtsmarkt/i })
            ).toBeVisible();
        });
    });

    it('should render preview', () => {
        const screen = render(
            <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
            {},
            { currentUser: SomeUser, useCache: true }
        );
        expect(
            screen.getByRole('heading', { name: /weihnachtsmarkt/i })
        ).toBeVisible();
    });

    describe('preview image', () => {
        it('should not render if not available', () => {
            const screen = render(
                <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
                {},
                { currentUser: SomeUser, useCache: true }
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
                { currentUser: SomeUser, useCache: true }
            );
            expect(
                screen.getByRole('img', { name: /vorschaubild/i })
            ).toBeVisible();
            expect(
                screen.getByRole('img', { name: /vorschaubild/i })
            ).toHaveAttribute(
                'src',
                expect.stringContaining('https://fakes3/meinbild.jpg')
            );
        });
    });

    it('should render tags', () => {
        const screen = render(
            <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
            {},
            { currentUser: SomeUser, useCache: true }
        );
        expect(screen.getByText('La Revolucion')).toBeVisible();
    });

    it('should render last update time', () => {
        const screen = render(
            <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
            {},
            { currentUser: SomeUser, useCache: true }
        );
        expect(screen.getByText('11.10.2020')).toBeVisible();
    });

    describe('Edit Button', () => {
        const admin = { ...SomeUser, groups: [adminGroup] };

        it('should be shown for admin', () => {
            const screen = render(
                <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
                {},
                { currentUser: admin, useCache: true }
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
                { currentUser: admin, useCache: true }
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
                { currentUser: SomeUser, useCache: true }
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
                { currentUser: SomeUser, useCache: true }
            );
            expect(
                screen.queryByRole('button', { name: /beitrag bearbeiten/i })
            ).toBeNull();
        });

        it('should not be shown for other user', () => {
            const screen = render(
                <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
                {},
                { currentUser: SomeUser, useCache: true }
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
                { currentUser: SomeUser, useCache: true }
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
                { currentUser: admin, useCache: true }
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
                { currentUser: admin, useCache: true }
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
                { currentUser: SomeUser, useCache: true }
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
                { currentUser: SomeUser, useCache: true }
            );
            expect(
                screen.queryByRole('button', { name: /beitrag .+ anpinnen/i })
            ).toBeNull();
        });

        it('should not be shown for other user', () => {
            const screen = render(
                <ArticlePreviewStandardLayout article={Weihnachtsmarkt} />,
                {},
                { currentUser: SomeUser, useCache: true }
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
                { currentUser: SomeUser, useCache: true }
            );
            expect(
                screen.queryByRole('button', { name: /beitrag .+ anpinnen/i })
            ).toBeNull();
        });
    });
});
