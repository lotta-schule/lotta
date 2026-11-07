import { Locator, Page, expect } from '@playwright/test';

/**
 * On mobile, the user navigation and the widgets live in a drawer that is
 * opened from the navigation bar. Opens it and returns it.
 */
export const openMobileDrawer = async (page: Page) => {
  // Before hydration, the page shows the desktop sidebar (same test id) until it
  // knows it's on mobile: only accept the drawer itself.
  const drawer = page.locator(
    '[data-testid="BaseLayoutSidebar"][role="presentation"]'
  );
  // The closed drawer is faded out and moved out of view, but counts as
  // visible: wait for it to be fully shown. A tap right after loading can be
  // lost: tap again then.
  await expect(async () => {
    if (!(await isShown(drawer))) {
      await page.getByRole('button', { name: 'Nutzermenü öffnen' }).click();
    }
    await expect(drawer).toHaveCSS('opacity', '1', { timeout: 2_000 });
  }).toPass({ timeout: 15_000 });
  return drawer;
};

const isShown = async (drawer: Locator) =>
  (await drawer.evaluate((el) => getComputedStyle(el).opacity)) !== '0';

/**
 * Clicks an entry of the user navigation: the "Mein Profil" menu on desktop,
 * the buttons in the drawer on mobile.
 */
export const clickUserMenuEntry = async (
  page: Page,
  isMobile: boolean,
  entry: { desktop: string | RegExp; mobile: string | RegExp }
) => {
  if (isMobile) {
    const drawer = await openMobileDrawer(page);
    await drawer
      .getByRole('button', { name: entry.mobile })
      .or(drawer.getByRole('link', { name: entry.mobile }))
      .first()
      .click();
  } else {
    await page.getByRole('button', { name: /mein profil/i }).click();
    await page.getByRole('menuitem', { name: entry.desktop }).click();
  }
};
