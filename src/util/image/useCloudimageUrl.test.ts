jest.mock('next/config', () => () => ({
    publicRuntimeConfig: {
        cloudimageToken: 'test',
    },
}));

import { renderHook } from '@testing-library/react-hooks';
import { useCloudimageUrl } from './useCloudimageUrl';

describe('useCloudimageUrl', () => {
    describe('with cloudimage config', () => {
        it('with given width and height', () => {
            const screen = renderHook(() =>
                useCloudimageUrl('https://my.image/on-path', {
                    width: 200,
                    height: 100,
                    resize: 'cover',
                })
            );

            expect(screen.result.current.url).toEqual(
                'https://test.cloudimg.io/v7/my.image/on-path?sharp=1&width=200&height=100&func=cover&gravity=auto'
            );
            expect(screen.result.current.sizeMap).toEqual({
                '200w': 'https://test.cloudimg.io/v7/my.image/on-path?sharp=1&width=200&height=300&func=cover&gravity=auto',
            });
            expect(screen.result.current.customStyle).toEqual({});
        });

        it('with width and aspectRatio', () => {
            const screen = renderHook(() =>
                useCloudimageUrl('https://my.image/on-path', {
                    width: 500,
                    aspectRatio: '4:3',
                    resize: 'cover',
                })
            );

            expect(screen.result.current.url).toEqual(
                'https://test.cloudimg.io/v7/my.image/on-path?sharp=1&width=500&func=cover&gravity=auto&aspect_ratio=4%3A3'
            );
            expect(screen.result.current.sizeMap).toEqual({
                '300w': 'https://test.cloudimg.io/v7/my.image/on-path?sharp=1&width=300&func=cover&gravity=auto&aspect_ratio=4%3A3',
                '500w': 'https://test.cloudimg.io/v7/my.image/on-path?sharp=1&width=500&func=cover&gravity=auto&aspect_ratio=4%3A3',
                '700w': 'https://test.cloudimg.io/v7/my.image/on-path?sharp=1&width=700&func=cover&gravity=auto&aspect_ratio=4%3A3',
            });
            expect(screen.result.current.customStyle).toEqual({
                aspectRatio: '1.3333333333333333',
            });
        });

        it('with only height', () => {
            const screen = renderHook(() =>
                useCloudimageUrl('https://my.image/on-path', {
                    height: 200,
                })
            );

            expect(screen.result.current.url).toEqual(
                'https://test.cloudimg.io/v7/my.image/on-path?sharp=1&height=200&func=cover&gravity=auto'
            );
            expect(screen.result.current.sizeMap).toEqual({
                '200h': 'https://test.cloudimg.io/v7/my.image/on-path?sharp=1&height=200&func=cover&gravity=auto',
            });
            expect(screen.result.current.customStyle).toEqual({});
        });

        it('should compute height with width and aspectRatio', () => {
            const screen = renderHook(() =>
                useCloudimageUrl('https://my.image/on-path', {
                    width: 200,
                    aspectRatio: '6:1',
                    resize: 'fit',
                })
            );

            expect(screen.result.current.url).toEqual(
                'https://test.cloudimg.io/v7/my.image/on-path?sharp=1&width=200&func=fit&gravity=auto&height=33&aspect_ratio=6%3A1'
            );
            expect(screen.result.current.sizeMap).toEqual({
                '200w': 'https://test.cloudimg.io/v7/my.image/on-path?sharp=1&width=200&func=fit&gravity=auto&height=33&aspect_ratio=6%3A1',
            });
            expect(screen.result.current.customStyle).toEqual({});
        });
    });
});
