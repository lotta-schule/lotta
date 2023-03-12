import { renderHook } from '@testing-library/react-hooks';
import { useImageUrl } from './useImageUrl';

describe('useImageUrl', () => {
    describe('with cloudimage config', () => {
        it('with given width and height', () => {
            const screen = renderHook(() =>
                useImageUrl('https://my.image/on-path', {
                    width: 200,
                    height: 100,
                    resize: 'cover',
                })
            );

            expect(screen.result.current.url).toEqual(
                'https://my.image/on-path?width=200&height=100&fn=cover'
            );
            expect(screen.result.current.sizeMap).toEqual({
                '200w': 'https://my.image/on-path?width=200&height=300&fn=cover',
            });
            expect(screen.result.current.customStyle).toEqual({});
        });

        it('with width and aspectRatio', () => {
            const screen = renderHook(() =>
                useImageUrl('https://my.image/on-path', {
                    width: 500,
                    aspectRatio: '4:3',
                    resize: 'cover',
                })
            );

            expect(screen.result.current.url).toEqual(
                'https://my.image/on-path?width=500&height=375&fn=cover'
            );
            expect(screen.result.current.sizeMap).toEqual({
                '300w': 'https://my.image/on-path?width=300&height=225&fn=cover',
                '500w': 'https://my.image/on-path?width=500&height=375&fn=cover',
                '700w': 'https://my.image/on-path?width=700&height=525&fn=cover',
            });
            expect(screen.result.current.customStyle).toEqual({
                aspectRatio: '1.3333333333333333',
            });
        });

        it('with only height', () => {
            const screen = renderHook(() =>
                useImageUrl('https://my.image/on-path', {
                    height: 200,
                })
            );

            expect(screen.result.current.url).toEqual(
                'https://my.image/on-path?height=200&fn=cover'
            );
            expect(screen.result.current.sizeMap).toEqual({
                '200h': 'https://my.image/on-path?height=200&fn=cover',
            });
            expect(screen.result.current.customStyle).toEqual({});
        });

        it('should compute height with width and aspectRatio', () => {
            const screen = renderHook(() =>
                useImageUrl('https://my.image/on-path', {
                    width: 200,
                    aspectRatio: '6:1',
                    resize: 'fit',
                })
            );

            expect(screen.result.current.url).toEqual(
                'https://my.image/on-path?width=200&height=33&fn=fit'
            );
            expect(screen.result.current.sizeMap).toEqual({
                '200w': 'https://my.image/on-path?width=200&height=33&fn=fit',
            });
            expect(screen.result.current.customStyle).toEqual({});
        });
    });
});
