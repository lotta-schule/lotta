import React from 'react';
import { render, waitFor } from 'test/util';
import { ContentModuleType } from 'model';
import { Klausurenplan, ComputerExperten } from 'test/fixtures';
import { ContentModule } from './ContentModule';
import { GetContentModuleResults } from 'api/query/GetContentModuleResults';
import userEvent from '@testing-library/user-event';

describe('component/article/module/ContentModule', () => {
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

        describe('when in edit mode', () => {
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
                expect(dragHandle).not.toBeVisible();
            });

            it('config bar should open a menu when clicking on settings button', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={textContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={textContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />
                );
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                await userEvent.click(
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

        describe('when in edit mode', () => {
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
                expect(dragHandle).not.toBeVisible();
            });

            it('config bar should open a menu when clicking on settings button', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={titleContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={titleContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />
                );
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                await userEvent.click(
                    screen.getByRole('button', { name: /modul löschen/i })
                );
                await waitFor(() => {
                    expect(deleteCallback).toHaveBeenCalled();
                });
            });

            it('should show the title configuration', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={titleContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                await userEvent.click(
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
        const imageContentModule = {
            id: '101100',
            sortKey: 10,
            type: ContentModuleType.IMAGE,
            files: [],
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

        describe('when in edit mode', () => {
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
                expect(dragHandle).not.toBeVisible();
            });

            it('config bar should open a menu when clicking on settings button', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={imageContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={imageContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />
                );
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                await userEvent.click(
                    screen.getByRole('button', { name: /modul löschen/i })
                );
                await waitFor(() => {
                    expect(deleteCallback).toHaveBeenCalled();
                });
            });
        });
    });

    describe('ImageCollection ContentModule', () => {
        const imageCollectionContentModule = {
            id: '101100',
            sortKey: 10,
            type: ContentModuleType.IMAGE_COLLECTION,
            files: [],
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

        describe('when in edit mode', () => {
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
                expect(dragHandle).not.toBeVisible();
            });

            it('config bar should open a menu when clicking on settings button', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={imageCollectionContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={imageCollectionContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />
                );
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                await userEvent.click(
                    screen.getByRole('button', { name: /modul löschen/i })
                );
                await waitFor(() => {
                    expect(deleteCallback).toHaveBeenCalled();
                });
            });

            it('should show the configuration', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={imageCollectionContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                await userEvent.click(
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

    describe('Video ContentModule', () => {
        const videoContentModule = {
            id: '101100',
            sortKey: 10,
            type: ContentModuleType.VIDEO,
            files: [],
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

        describe('when in edit mode', () => {
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
                expect(dragHandle).not.toBeVisible();
            });

            it('config bar should open a menu when clicking on settings button', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={videoContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={videoContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />
                );
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                await userEvent.click(
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

        describe('when in edit mode', () => {
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
                expect(dragHandle).not.toBeVisible();
            });

            it('config bar should open a menu when clicking on settings button', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={videoContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={videoContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />
                );
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                await userEvent.click(
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

        describe('when in edit mode', () => {
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
                expect(dragHandle).not.toBeVisible();
            });

            it('config bar should open a menu when clicking on settings button', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={downloadContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={downloadContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />
                );
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                await userEvent.click(
                    screen.getByRole('button', { name: /modul löschen/i })
                );
                await waitFor(() => {
                    expect(deleteCallback).toHaveBeenCalled();
                });
            });

            it('should show the configuration', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={downloadContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                await userEvent.click(
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

        describe('when in edit mode', () => {
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
                expect(dragHandle).not.toBeVisible();
            });

            it('config bar should open a menu when clicking on settings button', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
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
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
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
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                await userEvent.click(
                    screen.getByRole('button', { name: /modul löschen/i })
                );
                await waitFor(() => {
                    expect(deleteCallback).toHaveBeenCalled();
                });
            });

            it('should show the configuration', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
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
                await userEvent.click(
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

        describe('when in edit mode', () => {
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
                expect(dragHandle).not.toBeVisible();
            });

            it('config bar should open a menu when clicking on settings button', async () => {
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={tableContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={() => {}}
                    />
                );
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
            });

            it('should call the onRemoveContentModule callback when delete button is clicked', async () => {
                const deleteCallback = jest.fn();
                const screen = render(
                    <ContentModule
                        isEditModeEnabled
                        cardProps={{ style: { opacity: 0.8 } }}
                        contentModule={tableContentModule}
                        index={0}
                        onUpdateModule={() => {}}
                        onRemoveContentModule={deleteCallback}
                    />
                );
                await userEvent.click(
                    screen.getByRole('button', { name: /einstellungen/i })
                );
                expect(screen.getByRole('presentation')).toBeVisible();
                await userEvent.click(
                    screen.getByRole('button', { name: /modul löschen/i })
                );
                await waitFor(() => {
                    expect(deleteCallback).toHaveBeenCalled();
                });
            });
        });
    });
});
