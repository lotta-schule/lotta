import * as React from 'react';
import { render, waitFor } from 'test/util';
import { ContentModuleModel, ContentModuleType } from 'model';
import { Klausurenplan, ComputerExperten } from 'test/fixtures';
import { ContentModule } from './ContentModule';
import GetContentModuleResults from 'api/query/GetContentModuleResults.graphql';
import userEvent from '@testing-library/user-event';

describe('shared/article/module/ContentModule', () => {
    describe('in EditMode', () => {
        const textContentModule = ComputerExperten.contentModules[0];
        it('should show and call a "move up" button when onMoveUp prop is given', () => {
            const fn = jest.fn();
            const screen = render(
                <ContentModule
                    isEditModeEnabled
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
    });

    describe('Text ContentModule', () => {
        const textContentModule = ComputerExperten.contentModules[0];

        it('should render module in show mode', () => {
            const screen = render(
                <ContentModule
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
                        contentModule={textContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('config bar should open a menu when clicking on settings button', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={textContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={textContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                userEvent.click(
                    screen.getByRole('button', { name: /modul löschen/i })
                );
                await waitFor(() => {
                    expect(deleteCallback).toHaveBeenCalled();
                });
            });
        });
    });

    describe('Title ContentModule', () => {
        const titleContentModule = Klausurenplan.contentModules[0];

        it('should render module in show mode', () => {
            const screen = render(
                <ContentModule
                    contentModule={titleContentModule}
                    index={0}
                    onUpdateModule={() => {}}
                    onRemoveContentModule={() => {}}
                />
            );
            expect(screen.getByTestId('TitleContentModule')).toBeVisible();
        });

        describe('when in editor mode', () => {
            it('should add an (invisible) config bar', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        contentModule={titleContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('config bar should open a menu when clicking on settings button', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={titleContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={titleContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                userEvent.click(
                    screen.getByRole('button', { name: /modul löschen/i })
                );
                await waitFor(() => {
                    expect(deleteCallback).toHaveBeenCalled();
                });
            });

            it('should show the title configuration', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={titleContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                expect(
                    screen.getByTestId('TitleContentModuleConfiguration')
                ).toBeVisible();
            });
        });
    });

    describe('Image ContentModule', () => {
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
                        contentModule={imageContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('config bar should open a menu when clicking on settings button', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={imageContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={imageContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                userEvent.click(
                    screen.getByRole('button', { name: /modul löschen/i })
                );
                await waitFor(() => {
                    expect(deleteCallback).toHaveBeenCalled();
                });
            });
        });
    });

    describe('ImageCollection ContentModule', () => {
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
                        contentModule={imageCollectionContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('config bar should open a menu when clicking on settings button', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={imageCollectionContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={imageCollectionContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                userEvent.click(
                    screen.getByRole('button', { name: /modul löschen/i })
                );
                await waitFor(() => {
                    expect(deleteCallback).toHaveBeenCalled();
                });
            });

            it('should show the configuration', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={imageCollectionContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                expect(
                    screen.getByTestId(
                        'ImageCollectionContentModuleConfiguration'
                    )
                ).toBeVisible();
            });
        });
    });

    describe('Image ContentModule', () => {
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
                        contentModule={videoContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('config bar should open a menu when clicking on settings button', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={videoContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={videoContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                userEvent.click(
                    screen.getByRole('button', { name: /modul löschen/i })
                );
                await waitFor(() => {
                    expect(deleteCallback).toHaveBeenCalled();
                });
            });
        });
    });

    describe('Audio ContentModule', () => {
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
                        contentModule={videoContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('config bar should open a menu when clicking on settings button', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={videoContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={videoContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                userEvent.click(
                    screen.getByRole('button', { name: /modul löschen/i })
                );
                await waitFor(() => {
                    expect(deleteCallback).toHaveBeenCalled();
                });
            });
        });
    });

    describe('Download ContentModule', () => {
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
                        contentModule={downloadContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('config bar should open a menu when clicking on settings button', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={downloadContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={downloadContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                userEvent.click(
                    screen.getByRole('button', { name: /modul löschen/i })
                );
                await waitFor(() => {
                    expect(deleteCallback).toHaveBeenCalled();
                });
            });

            it('should show the configuration', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={downloadContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                expect(
                    screen.getByTestId('DownloadContentModuleConfiguration')
                ).toBeVisible();
            });
        });
    });

    describe('Form ContentModule', () => {
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
                    contentModule={formContentModule}
                    index={0}
                    onUpdateModule={() => {}}
                    onRemoveContentModule={() => {}}
                />
            );
            expect(screen.getByTestId('FormContentModule')).toBeVisible();
        });

        describe('when in editor mode', () => {
            it('should add an (invisible) config bar', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        contentModule={formContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('config bar should open a menu when clicking on settings button', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={formContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />,
                    {},
                    {
                        additionalMocks: [
                            {
                                request: {
                                    query: GetContentModuleResults,
                                    variables: {
                                        contentModuleId: formContentModule.id,
                                    },
                                },
                                result: { data: { contentModuleResults: [] } },
                            },
                        ],
                    }
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={formContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />,
                    {},
                    {
                        additionalMocks: [
                            {
                                request: {
                                    query: GetContentModuleResults,
                                    variables: {
                                        contentModuleId: formContentModule.id,
                                    },
                                },
                                result: { data: { contentModuleResults: [] } },
                            },
                        ],
                    }
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                userEvent.click(
                    screen.getByRole('button', { name: /modul löschen/i })
                );
                await waitFor(() => {
                    expect(deleteCallback).toHaveBeenCalled();
                });
            });

            it('should show the configuration', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={formContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />,
                    {},
                    {
                        additionalMocks: [
                            {
                                request: {
                                    query: GetContentModuleResults,
                                    variables: {
                                        contentModuleId: formContentModule.id,
                                    },
                                },
                                result: { data: { contentModuleResults: [] } },
                            },
                        ],
                    }
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                expect(
                    screen.getByTestId('FormContentModuleConfiguration')
                ).toBeVisible();
            });
        });
    });

    describe('Table ContentModule', () => {
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
                        contentModule={tableContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                const dragHandle = screen.getByTitle(/ziehen zum verschieben/i);
                expect(dragHandle).toBeInTheDocument();
            });

            it('config bar should open a menu when clicking on settings button', () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={tableContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        elementProps={{ style: { opacity: 0.8 } }}
                        contentModule={tableContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />
                );
                userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                userEvent.click(
                    screen.getByRole('button', { name: /modul löschen/i })
                );
                await waitFor(() => {
                    expect(deleteCallback).toHaveBeenCalled();
                });
            });
        });
    });
});
