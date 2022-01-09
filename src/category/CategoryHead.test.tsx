import * as React from 'react';
import { render, waitFor, getMetaTagValue } from 'test/util';
import { FaecherCategory, StartseiteCategory } from 'test/fixtures';
import { CategoryHead } from './CategoryHead';

describe('shared/category/CategoryHead', () => {
    describe('is homepage', () => {
        it('should show the correct title in the Browser header', async () => {
            render(<CategoryHead category={StartseiteCategory} />);
            await waitFor(() => {
                expect(document.title).toBe('DerEineVonHier');
                expect(getMetaTagValue('description')).toEqual(
                    'DerEineVonHier'
                );
                expect(getMetaTagValue('og:type')).toEqual('website');
            });
        });

        it('show the correct url', async () => {
            render(<CategoryHead category={StartseiteCategory} />);
            await waitFor(() => {
                expect(getMetaTagValue('og:url')).toEqual(
                    'https://info.lotta.schule/'
                );
            });
        });
    });

    describe('is not homepage', () => {
        it('should show the correct title in the Browser header', async () => {
            render(<CategoryHead category={FaecherCategory} />);
            await waitFor(() => {
                expect(document.title).toBe('Fächer - DerEineVonHier');
                expect(getMetaTagValue('description')).toEqual(
                    'Fächer bei DerEineVonHier'
                );
                expect(getMetaTagValue('og:type')).toEqual('website');
            });
        });

        it('show the correct url', async () => {
            render(<CategoryHead category={FaecherCategory} />);
            await waitFor(() => {
                expect(getMetaTagValue('og:url')).toEqual(
                    'https://info.lotta.schule/c/2-Facher'
                );
            });
        });
    });
});
