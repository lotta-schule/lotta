import * as React from 'react';
import { usePathname } from 'next/navigation.js';
import { render, waitFor } from '#/test/util';
import { isMobileDrawerOpenVar } from '#/api/apollo/cache';
import { Sidebar } from './Sidebar';

vi.mock('@lotta-schule/hubert', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lotta-schule/hubert')>()),
  useIsMobile: () => true,
}));

describe('Sidebar on mobile', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/c/1-Start');
    isMobileDrawerOpenVar(false);
  });

  it('keeps the drawer open when the sidebar is replaced on the same page', async () => {
    const screen = render(<Sidebar isEmpty />);
    isMobileDrawerOpenVar(true);

    // e.g. a Suspense fallback being replaced by the loaded sidebar
    screen.rerender(<Sidebar key="loaded">Widgets</Sidebar>);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isMobileDrawerOpenVar()).toBe(true);
  });

  it('closes the drawer after navigating', async () => {
    const screen = render(<Sidebar />);
    isMobileDrawerOpenVar(true);

    vi.mocked(usePathname).mockReturnValue('/c/2-Aktuelles');
    screen.rerender(<Sidebar key="next-page" />);

    await waitFor(() => {
      expect(isMobileDrawerOpenVar()).toBe(false);
    });
  });
});
