import { renderHook } from '@testing-library/react-hooks';
import { useImageUrl } from './useImageUrl';

describe('useImageUrl', () => {
    describe('with cloudimage config', () => {
        it('should output a diverse sitemap with given width and height', () => {
            const screen = renderHook(() =>
                useImageUrl('https://my.image/on-path', {
                    width: 200,
                    height: 100,
                    resize: 'cover',
                    format: 'webp',
                })
            );

            expect(screen.result.current.url).toEqual(
                'https://my.image/on-path?width=200&height=100&fn=cover&format=webp'
            );
            expect(screen.result.current.sizeMap).toEqual({
                '100w': 'https://my.image/on-path?width=100&height=50&fn=cover&format=webp',
                '200w': 'https://my.image/on-path?width=200&height=100&fn=cover&format=webp',
                '400w': 'https://my.image/on-path?width=400&height=200&fn=cover&format=webp',
                '600w': 'https://my.image/on-path?width=600&height=300&fn=cover&format=webp',
            });
            expect(screen.result.current.customStyle).toEqual({});
        });

        it('should output a diverse sitemap with width and aspectRatio', () => {
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
                '250w': 'https://my.image/on-path?width=250&height=187&fn=cover',
                '500w': 'https://my.image/on-path?width=500&height=375&fn=cover',
                '1000w':
                    'https://my.image/on-path?width=1000&height=750&fn=cover',
                '1500w':
                    'https://my.image/on-path?width=1500&height=1125&fn=cover',
            });
            expect(screen.result.current.customStyle).toEqual({
                aspectRatio: '1.3333333333333333',
            });
        });

        it('should just use display depths with only height', () => {
            const screen = renderHook(() =>
                useImageUrl('https://my.image/on-path', {
                    height: 200,
                })
            );

            expect(screen.result.current.url).toEqual(
                'https://my.image/on-path?height=200&fn=cover'
            );
            expect(screen.result.current.sizeMap).toEqual({
                '1x': 'https://my.image/on-path?height=200&fn=cover',
                '2x': 'https://my.image/on-path?height=400&fn=cover',
                '3x': 'https://my.image/on-path?height=600&fn=cover',
            });
            expect(screen.result.current.customStyle).toEqual({});
        });

        it('should correctly compute height with width and aspectRatio', () => {
            const screen = renderHook(() =>
                useImageUrl('https://my.image/on-path', {
                    width: 200,
                    aspectRatio: '6:1',
                    resize: 'inside',
                })
            );

            expect(screen.result.current.url).toEqual(
                'https://my.image/on-path?width=200&height=33&fn=inside'
            );
            expect(screen.result.current.sizeMap).toEqual({
                '100w': 'https://my.image/on-path?width=100&height=16&fn=inside',
                '200w': 'https://my.image/on-path?width=200&height=33&fn=inside',
                '400w': 'https://my.image/on-path?width=400&height=66&fn=inside',
                '600w': 'https://my.image/on-path?width=600&height=100&fn=inside',
            });
            expect(screen.result.current.customStyle).toEqual({
                aspectRatio: '6',
            });
        });
    });
});
