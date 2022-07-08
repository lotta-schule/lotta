import * as React from 'react';
import { render, waitFor } from 'test/util';
import { ContentModuleModel, ContentModuleType } from 'model';
import {
    Klausurenplan,
    ComputerExperten,
    SomeUser,
    SomeUserin,
} from 'test/fixtures';
import { ContentModule } from './ContentModule';
import userEvent from '@testing-library/user-event';

import GetContentModuleResults from 'api/query/GetContentModuleResults.graphql';

describe('shared/article/module/ContentModule', () => {
    describe('in EditMode', () => {
        const article = ComputerExperten;
        const textContentModule = ComputerExperten.contentModules[0];
        it('should show and call a "move up" button when onMoveUp prop is given', () => {
            const fn = jest.fn();
            const screen = render(
                <ContentModule
                    isEditModeEnabled
                    article={article}
                    contentModule={textContentModule}
                    index={0}
                    onUpdateModule={() => {}}
                    onRemoveContentModule={() => {}}
                    onMoveUp={fn}
                />
            );
            userEvent.click(
                screen.getByRole('button', { name: /nach oben bewegen/i })
            );
            expect(fn).toHaveBeenCalled();
        });

        it('should show and call a "move down" button when onMoveDown prop is given', () => {
            const fn = jest.fn();
            const screen = render(
                <ContentModule
                    isEditModeEnabled
                    article={article}
                    contentModule={textContentModule}
                    index={0}
                    onUpdateModule={() => {}}
                    onRemoveContentModule={() => {}}
                    onMoveDown={fn}
                />
            );
            userEvent.click(
                screen.getByRole('button', { name: /nach unten bewegen/i })
            );
            expect(fn).toHaveBeenCalled();
        });

        it('should show delete button and call "onRemoveContentModule" on click', () => {
            const onRemoveContentModule = jest.fn();
            const screen = render(
                <ContentModule
                    isEditModeEnabled
                    article={article}
                    contentModule={textContentModule}
                    index={0}
                    onUpdateModule={jest.fn}
                    onRemoveContentModule={onRemoveContentModule}
                    onMoveDown={jest.fn}
                />
            );
            userEvent.click(screen.getByRole('button', { name: /löschen/i }));
            expect(onRemoveContentModule).toHaveBeenCalled();
        });
    });

    describe('Text ContentModule', () => {
        const article = ComputerExperten;
        const textContentModule = ComputerExperten.contentModules[0];

        it('should render module in show mode', () => {
            const screen = render(
                <ContentModule
                    article={article}
                    contentModule={textContentModule}
                    index={0}
                    onUpdateModule={() => {}}
                    onRemoveContentModule={() => {}}
                />
            );
            expect(screen.getByTestId('TextContentModule')).toBeVisible();
        });

        describe('when in editor mode', () => {
            it('should add an (invisible) config bar', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        article={article}
                        contentModule={textContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('no settings button should be visible', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        article={article}
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={textContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                expect(
                    screen.queryByRole('button', {
                        name: /moduleinstellungen/i,
                    })
                ).toBeNull();
            });
        });
    });

    describe('Title ContentModule', () => {
        const article = Klausurenplan;
        const titleContentModule = Klausurenplan.contentModules[0];

        it('should render module in show mode', () => {
            const screen = render(
                <ContentModule
                    article={article}
                    contentModule={titleContentModule}
                    index={0}
                    onUpdateModule={jest.fn}
                    onRemoveContentModule={jest.fn}
                />
            );
            expect(screen.getByTestId('TitleContentModule')).toBeVisible();
        });

        describe('when in editor mode', () => {
            it('should add an (invisible) config bar', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        article={article}
                        contentModule={titleContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('config dialog should open a menu when clicking on settings button', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        article={article}
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={titleContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /moduleinstellungen/i })
                );
                await waitFor(() => {
                    expect(
                        screen.getByRole('dialog', {
                            name: /moduleinstellungen/i,
                        })
                    ).toBeVisible();
                });
                expect(
                    screen.getByTestId('TitleContentModuleConfiguration')
                ).toBeVisible();
            });
        });
    });

    describe('Image ContentModule', () => {
        const article = ComputerExperten;
        const imageContentModule: ContentModuleModel = {
            id: '101100',
            sortKey: 10,
            type: ContentModuleType.IMAGE,
            files: [],
            updatedAt: new Date().toString(),
            insertedAt: new Date().toString(),
            content: {},
            configuration: {},
        };

        it('should render module in show mode', () => {
            const screen = render(
                <ContentModule
                    article={article}
                    contentModule={imageContentModule}
                    index={0}
                    onUpdateModule={() => {}}
                    onRemoveContentModule={() => {}}
                />
            );
            expect(screen.getByTestId('ImageContentModule')).toBeVisible();
        });

        describe('when in editor mode', () => {
            it('should add an (invisible) config bar', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        article={article}
                        contentModule={imageContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('no settings button should be visible', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        article={article}
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={imageContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                expect(
                    screen.queryByRole('button', {
                        name: /moduleinstellungen/i,
                    })
                ).toBeNull();
            });
        });
    });

    describe('ImageCollection ContentModule', () => {
        const article = ComputerExperten;
        const imageCollectionContentModule: ContentModuleModel = {
            id: '101100',
            sortKey: 10,
            type: ContentModuleType.IMAGE_COLLECTION,
            files: [],
            insertedAt: new Date().toString(),
            updatedAt: new Date().toString(),
            content: {},
            configuration: {},
        };

        it('should render a imageCollection module in show mode', () => {
            const screen = render(
                <ContentModule
                    article={article}
                    contentModule={imageCollectionContentModule}
                    index={0}
                    onUpdateModule={() => {}}
                    onRemoveContentModule={() => {}}
                />
            );
            expect(
                screen.getByTestId('ImageCollectionContentModule')
            ).toBeVisible();
        });

        describe('when in editor mode', () => {
            it('should add an (invisible) config bar', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        article={article}
                        contentModule={imageCollectionContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('config bar should open the settings dialog when clicking on settings button', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        article={article}
                        contentModule={imageCollectionContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /moduleinstellungen/i })
                );
                await waitFor(() => {
                    expect(screen.getByRole('dialog')).toBeVisible();
                });
                expect(
                    screen.getByTestId(
                        'ImageCollectionContentModuleConfiguration'
                    )
                ).toBeVisible();
            });
        });
    });

    describe('Image ContentModule', () => {
        const article = ComputerExperten;
        const dividerContentModule: ContentModuleModel = {
            id: '101100',
            sortKey: 10,
            type: ContentModuleType.DIVIDER,
            files: [],
            updatedAt: new Date().toString(),
            insertedAt: new Date().toString(),
            content: {},
            configuration: {},
        };

        it('should render module in show mode', () => {
            const screen = render(
                <ContentModule
                    article={article}
                    contentModule={dividerContentModule}
                    index={0}
                    onUpdateModule={() => {}}
                    onRemoveContentModule={() => {}}
                />
            );
            expect(screen.getByTestId('DividerContentModule')).toBeVisible();
        });
    });

    describe('Video ContentModule', () => {
        const article = ComputerExperten;
        const videoContentModule = {
            id: '101100',
            sortKey: 10,
            type: ContentModuleType.VIDEO,
            files: [],
            insertedAt: new Date().toString(),
            updatedAt: new Date().toString(),
            content: {},
            configuration: {},
        };

        it('should render module in show mode', () => {
            const screen = render(
                <ContentModule
                    article={article}
                    contentModule={videoContentModule}
                    index={0}
                    onUpdateModule={() => {}}
                    onRemoveContentModule={() => {}}
                />
            );
            expect(screen.getByTestId('VideoContentModule')).toBeVisible();
        });

        describe('when in editor mode', () => {
            it('should add an (invisible) config bar', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        article={article}
                        contentModule={videoContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('no settings button should be visible', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        article={article}
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={videoContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                expect(
                    screen.queryByRole('button', {
                        name: /moduleinstellungen/i,
                    })
                ).toBeNull();
            });
        });
    });

    describe('Audio ContentModule', () => {
        const article = ComputerExperten;
        const videoContentModule = {
            id: '101100',
            sortKey: 10,
            type: ContentModuleType.AUDIO,
            files: [],
            insertedAt: new Date().toString(),
            updatedAt: new Date().toString(),
            content: {},
            configuration: {},
        };

        it('should render module in show mode', () => {
            const screen = render(
                <ContentModule
                    article={article}
                    contentModule={videoContentModule}
                    index={0}
                    onUpdateModule={() => {}}
                    onRemoveContentModule={() => {}}
                />
            );
            expect(screen.getByTestId('AudioContentModule')).toBeVisible();
        });

        describe('when in editor mode', () => {
            it('should add an (invisible) config bar', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        article={article}
                        contentModule={videoContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('no settings button should be visible', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        article={article}
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={videoContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                expect(
                    screen.queryByRole('button', {
                        name: /moduleinstellungen/i,
                    })
                ).toBeNull();
            });
        });
    });

    describe('Download ContentModule', () => {
        const article = ComputerExperten;
        const downloadContentModule = {
            id: '101100',
            sortKey: 10,
            type: ContentModuleType.DOWNLOAD,
            files: [],
            insertedAt: new Date().toString(),
            updatedAt: new Date().toString(),
            content: {},
            configuration: {},
        };

        it('should render module in show mode', () => {
            const screen = render(
                <ContentModule
                    article={article}
                    contentModule={downloadContentModule}
                    index={0}
                    onUpdateModule={() => {}}
                    onRemoveContentModule={() => {}}
                />
            );
            expect(screen.getByTestId('DownloadContentModule')).toBeVisible();
        });

        describe('when in editor mode', () => {
            it('should add an (invisible) config bar', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        article={article}
                        contentModule={downloadContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('config bar should open the settings dialog when clicking on settings button', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        article={article}
                        contentModule={downloadContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /moduleinstellungen/i })
                );
                await waitFor(() => {
                    expect(screen.getByRole('dialog')).toBeVisible();
                });
                expect(
                    screen.getByTestId('DownloadContentModuleConfiguration')
                ).toBeVisible();
            });
        });
    });

    describe('Form ContentModule', () => {
        const article = { ...ComputerExperten, users: [SomeUser] };
        const formContentModule = {
            id: '101100',
            sortKey: 10,
            type: ContentModuleType.FORM,
            files: [],
            insertedAt: new Date().toString(),
            updatedAt: new Date().toString(),
            content: {},
            configuration: {},
        };

        it('should render module in show mode', () => {
            const screen = render(
                <ContentModule
                    article={article}
                    contentModule={formContentModule}
                    index={0}
                    onUpdateModule={() => {}}
                    onRemoveContentModule={() => {}}
                />
            );
            expect(screen.getByTestId('FormContentModule')).toBeVisible();
        });

        it('should show an author the "See data" button and open the dialog when clicked', async () => {
            const screen = render(
                <ContentModule
                    article={article}
                    contentModule={formContentModule}
                    index={0}
                    onUpdateModule={() => {}}
                    onRemoveContentModule={() => {}}
                />,
                {},
                { currentUser: SomeUser }
            );
            expect(
                screen.getByRole('button', { name: /einsendungen sehen/i })
            ).toBeVisible();
            userEvent.click(
                screen.getByRole('button', { name: /einsendungen sehen/i })
            );
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeVisible();
            });
        });

        it('should not show a non-author the "See data" button and open the dialog when clicked', async () => {
            const screen = render(
                <ContentModule
                    article={article}
                    contentModule={formContentModule}
                    index={0}
                    onUpdateModule={() => {}}
                    onRemoveContentModule={() => {}}
                />,
                {},
                { currentUser: SomeUserin }
            );
            expect(
                screen.queryByRole('button', { name: /einsendungen sehen/i })
            ).toBeNull();
        });

        describe('when in editor mode', () => {
            it('should add an (invisible) config bar', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        article={article}
                        contentModule={formContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('no settings button should be visible', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        article={article}
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={formContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                expect(
                    screen.queryByRole('button', {
                        name: /moduleinstellungen/i,
                    })
                ).toBeNull();
            });
        });
    });

    describe('Table ContentModule', () => {
        const article = ComputerExperten;
        const tableContentModule = {
            id: '101100',
            sortKey: 10,
            type: ContentModuleType.TABLE,
            files: [],
            content: {},
            insertedAt: new Date().toString(),
            updatedAt: new Date().toString(),
            configuration: {},
        };

        it('should render module in show mode', () => {
            const screen = render(
                <ContentModule
                    article={article}
                    contentModule={tableContentModule}
                    index={0}
                    onUpdateModule={() => {}}
                    onRemoveContentModule={() => {}}
                />
            );
            expect(screen.getByTestId('TableContentModule')).toBeVisible();
        });

        describe('when in editor mode', () => {
            it('should add an (invisible) config bar', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        article={article}
                        contentModule={tableContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('no settings button should be visible', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        article={article}
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={tableContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                expect(
                    screen.queryByRole('button', {
                        name: /moduleinstellungen/i,
                    })
                ).toBeNull();
            });
        });
    });
});
