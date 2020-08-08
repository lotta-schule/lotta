import React from 'react';
import { FileModel } from 'model';
import { render, cleanup, waitFor } from 'test/util';
import { SomeUser, getPrivateAndPublicFiles } from 'test/fixtures';
import { ProfileDeleteFileSelection } from './ProfileDeleteFileSelection';
import userEvent from '@testing-library/user-event';

afterEach(cleanup);

describe('component/article/ProfileDeleteFileSelection', () => {

    const files =
        getPrivateAndPublicFiles(SomeUser)
            .filter(f => !!(f as FileModel).userId) as FileModel[];
    // Dateiname.jpg, Animiert.gif, Manifest.pdf, Bilderbuch.pdf, Amelie.mp4, Kaenguru.wav, praesi.ppt

    it('should render an ProfileDeleteFileSelection', async () => {
        const screen = render(
            <ProfileDeleteFileSelection files={[]} selectedFiles={[]} onSelectFiles={() => {}} />,
        );
    });

    it('should not show any lines when no files are given', async () => {
        const screen = render(
            <ProfileDeleteFileSelection files={[]} selectedFiles={[]} onSelectFiles={() => {}} />,
        );
        expect(await screen.queryAllByRole('checkbox')).toHaveLength(0);
    });

    it('should render all given file names', () => {
        const screen = render(
            <ProfileDeleteFileSelection
                files={files}
                selectedFiles={[]}
                onSelectFiles={() => {}}
            />,
        );
        const checkboxes = screen.queryAllByRole('checkbox');
        expect(checkboxes).toHaveLength(8);
        expect(screen.getByRole('checkbox', { name: /alle Dateien/i })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Dateiname.jpg' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Animiert.gif' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Manifest.pdf' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Bilderbuch.pdf' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Amelie.mp4' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Kaenguru.wav' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'praesi.ppt' })).toBeInTheDocument();
    });

    describe('checkbox state', () => {
        it('should have all selected files ticked', () => {
            const screen = render(
                <ProfileDeleteFileSelection
                    files={files}
                    selectedFiles={files.slice(0, 3)}
                    onSelectFiles={() => {}}
                />,
            );
            expect(screen.getAllByRole('checkbox')).toHaveLength(8);
            expect(screen.getByRole('checkbox', { name: 'Dateiname.jpg' })).toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'Animiert.gif' })).toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'Manifest.pdf' })).toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'Bilderbuch.pdf' })).not.toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'Amelie.mp4' })).not.toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'Kaenguru.wav' })).not.toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'praesi.ppt' })).not.toBeChecked();
        });

        it('"select all" checkbox should not be checked when no selected files are given', () => {
            const screen = render(
                <ProfileDeleteFileSelection
                    files={files}
                    selectedFiles={[]}
                    onSelectFiles={() => {}}
                />,
            );
            expect(screen.getByRole('checkbox', { name: /alle Dateien/i })).not.toBeChecked();
        });

        it('"select all" checkbox should be checked when all selected files are given', () => {
            const screen = render(
                <ProfileDeleteFileSelection
                    files={files}
                    selectedFiles={[...files]}
                    onSelectFiles={() => {}}
                />,
            );
            expect(screen.getByRole('checkbox', { name: /alle Dateien/i })).toBeChecked();
        });

        it('"select all" checkbox should be in intermediate state when two selected files are given', () => {
            const screen = render(
                <ProfileDeleteFileSelection
                    files={files}
                    selectedFiles={files.slice(0, 2)}
                    onSelectFiles={() => {}}
                />,
            );
            expect(screen.getByRole('checkbox', { name: /alle Dateien/i })).toHaveProperty('value', 'mixed');
        });

    });

    describe('request selection change', () => {
        it('should call change function including new file requested upon click', async done => {
            const callback = jest.fn((newSelection: FileModel[]) => {
                expect(newSelection).toHaveLength(4);
                expect(newSelection.find(f => f.filename === 'Amelie.mp4')).toBeDefined();
            });
            const screen = render(
                <ProfileDeleteFileSelection
                    files={files}
                    selectedFiles={files.slice(0, 3)}
                    onSelectFiles={callback}
                />,
            );
            expect(screen.getAllByRole('checkbox')).toHaveLength(8);
            expect(screen.getByRole('checkbox', { name: 'Dateiname.jpg' })).toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'Animiert.gif' })).toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'Manifest.pdf' })).toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'Bilderbuch.pdf' })).not.toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'Amelie.mp4' })).not.toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'Kaenguru.wav' })).not.toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'praesi.ppt' })).not.toBeChecked();

            await userEvent.click(screen.getByRole('checkbox', { name: 'Amelie.mp4' }));

            await waitFor(() => {
                expect(callback).toHaveBeenCalled();
            });
            done();
        });

        it('should call change function without file unchecked upon click', async done => {
            const callback = jest.fn((newSelection: FileModel[]) => {
                expect(newSelection).toHaveLength(2);
                expect(newSelection.find(f => f.filename === 'Animiert.gif')).not.toBeDefined();
            });
            const screen = render(
                <ProfileDeleteFileSelection
                    files={files}
                    selectedFiles={files.slice(0, 3)}
                    onSelectFiles={callback}
                />,
            );
            expect(screen.getAllByRole('checkbox')).toHaveLength(8);
            expect(screen.getByRole('checkbox', { name: 'Dateiname.jpg' })).toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'Animiert.gif' })).toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'Manifest.pdf' })).toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'Bilderbuch.pdf' })).not.toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'Amelie.mp4' })).not.toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'Kaenguru.wav' })).not.toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'praesi.ppt' })).not.toBeChecked();

            await userEvent.click(screen.getByRole('checkbox', { name: 'Animiert.gif' }));

            await waitFor(() => {
                expect(callback).toHaveBeenCalled();
            });
            done();
        });

        it('should call change function requesting all files when "select all" checkbox is click in off state', async done => {
            const callback = jest.fn((newSelection: FileModel[]) => {
                expect(newSelection).toHaveLength(7);
                expect(newSelection.map(f => f.filename).sort()).toEqual([
                    'Amelie.mp4',
                    'Animiert.gif',
                    'Bilderbuch.pdf',
                    'Dateiname.jpg',
                    'Kaenguru.wav',
                    'Manifest.pdf',
                    'praesi.ppt'
                ]);
            });
            const screen = render(
                <ProfileDeleteFileSelection
                    files={files}
                    selectedFiles={[]}
                    onSelectFiles={callback}
                />,
            );
            await userEvent.click(screen.getByRole('checkbox', { name: /alle dateien/i }));

            await waitFor(() => {
                expect(callback).toHaveBeenCalled();
            });
            done();
        });

        it('should call change function requesting no files when "select all" checkbox is clicked in on state', async done => {
            const callback = jest.fn((newSelection: FileModel[]) => {
                expect(newSelection).toHaveLength(0);
            });
            const screen = render(
                <ProfileDeleteFileSelection
                    files={files}
                    selectedFiles={[...files]}
                    onSelectFiles={callback}
                />,
            );
            await userEvent.click(screen.getByRole('checkbox', { name: /alle dateien/i }));

            await waitFor(() => {
                expect(callback).toHaveBeenCalled();
            });
            done();
        });

        it('should call change function requesting all files when "select all" checkbox is click in mixed state', async done => {
            const callback = jest.fn((newSelection: FileModel[]) => {
                expect(newSelection).toHaveLength(7);
                expect(newSelection.map(f => f.filename).sort()).toEqual([
                    'Amelie.mp4',
                    'Animiert.gif',
                    'Bilderbuch.pdf',
                    'Dateiname.jpg',
                    'Kaenguru.wav',
                    'Manifest.pdf',
                    'praesi.ppt'
                ]);
            });
            const screen = render(
                <ProfileDeleteFileSelection
                    files={files}
                    selectedFiles={files.slice(0, 3)}
                    onSelectFiles={callback}
                />,
            );
            await userEvent.click(screen.getByRole('checkbox', { name: /alle dateien/i }));

            await waitFor(() => {
                expect(callback).toHaveBeenCalled();
            });
            done();
        });

    });
});
