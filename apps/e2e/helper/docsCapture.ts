import { mkdir, rm } from 'fs/promises';
import path from 'path';
import {
  Browser,
  BrowserContextOptions,
  Locator,
  Page,
  test,
} from '@playwright/test';

/**
 * Screenshots and videos for the documentation (apps/docs).
 * Used by the `docs` and `docs-mobile` Playwright projects (see `docs/`).
 */

const DOCS_ASSETS_DIR = path.resolve(__dirname, '../../docs/src/assets');

export const DOCS_SCREENSHOTS_DIR = path.join(DOCS_ASSETS_DIR, 'screenshots');
export const DOCS_VIDEOS_DIR = path.join(DOCS_ASSETS_DIR, 'videos');

const HIGHLIGHT_ATTRIBUTE = 'data-docs-highlight';

/** The date shown instead of the real ones (creation dates of seeded content change every run) */
export const DOCS_DATE = { day: '14', month: '09', year: '2026' };

/**
 * Replaces the dates in all `<time>` elements (dd.MM.yyyy) with DOCS_DATE.
 * Returns a function restoring the original texts.
 */
const fixDates = async (page: Page) => {
  await page.evaluate((date) => {
    const w = window as any;
    w.__docsDates = [];
    for (const time of Array.from(document.querySelectorAll('time'))) {
      const walker = document.createTreeWalker(time, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent ?? '';
        const fixed = text.replace(
          /\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/g,
          (_m, _d, _mo, y: string) =>
            `${date.day}.${date.month}.${y.length === 2 ? date.year.slice(2) : date.year}`
        );
        if (fixed !== text) {
          w.__docsDates.push([node, text]);
          node.textContent = fixed;
        }
      }
    }
  }, DOCS_DATE);

  return () =>
    page.evaluate(() => {
      const w = window as any;
      for (const [node, text] of w.__docsDates ?? []) node.textContent = text;
      delete w.__docsDates;
    });
};

/** CSS applied while taking the screenshot only */
const CAPTURE_STYLE = `
  [${HIGHLIGHT_ATTRIBUTE}] {
    outline: 3px solid #e5004f !important;
    /* inside the element: an outline outside would be cut off at the edge of drawers and dialogs */
    outline-offset: -3px !important;
    border-radius: 4px;
  }
  /* no scrollbars in the docs */
  * { scrollbar-width: none !important; }
  *::-webkit-scrollbar { display: none !important; }
`;

/** `-mobile` for the mobile project, so desktop and mobile assets can live side by side */
const assetName = (name: string) =>
  test.info().project.use.isMobile ? `${name}-mobile` : name;

/**
 * Waits until the page looks "finished": fonts loaded, images decoded, no
 * pending requests. Without it, screenshots differ from run to run.
 */
export const waitForStableRendering = async (page: Page) => {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            })
        )
    );
  });
};

/**
 * Waits until the element stops moving (e.g. a drawer sliding in: JS-driven
 * animations are not stopped by Playwright's `animations: 'disabled'`).
 */
export const waitForStablePosition = async (locator: Locator) => {
  await locator.evaluate(
    (el) =>
      new Promise<void>((resolve) => {
        let last = '';
        let stableFrames = 0;
        const check = () => {
          const { x, y, width, height } = el.getBoundingClientRect();
          const box = [x, y, width, height].join();
          stableFrames = box === last ? stableFrames + 1 : 0;
          last = box;
          if (stableFrames >= 10) resolve();
          else requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      })
  );
};

export type CaptureOptions = {
  /** Only screenshot this element (default: the viewport) */
  locator?: Locator;
  /** Elements to cover, e.g. dates or other values that change between runs */
  mask?: Locator[];
  /** An element to draw an outline around, e.g. the button the docs talk about */
  highlight?: Locator;
  /** Screenshot the whole scrollable page instead of the viewport */
  fullPage?: boolean;
  /** Show DOCS_DATE instead of the real dates in `<time>` elements (default: true) */
  fixedDates?: boolean;
};

/**
 * Takes a screenshot for the documentation and saves it as
 * `apps/docs/src/assets/screenshots/<name>.png` (`<name>-mobile.png` on mobile).
 */
export const capture = async (
  page: Page,
  name: string,
  {
    locator,
    mask = [],
    highlight,
    fullPage = false,
    fixedDates = true,
  }: CaptureOptions = {}
) => {
  const file = path.join(DOCS_SCREENSHOTS_DIR, `${assetName(name)}.png`);
  await mkdir(DOCS_SCREENSHOTS_DIR, { recursive: true });

  await waitForStableRendering(page);
  for (const target of [locator, highlight]) {
    if (target) await waitForStablePosition(target);
  }

  const restoreDates = fixedDates ? await fixDates(page) : undefined;
  if (highlight) {
    await highlight.evaluate(
      (el, attr) => el.setAttribute(attr, ''),
      HIGHLIGHT_ATTRIBUTE
    );
  }

  try {
    const options = {
      path: file,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      mask,
      maskColor: '#e0e0e0',
      style: CAPTURE_STYLE,
    } as const;

    if (locator) {
      await locator.screenshot(options);
    } else {
      await page.screenshot({ ...options, fullPage });
    }
  } finally {
    await restoreDates?.();
    if (highlight) {
      await highlight.evaluate(
        (el, attr) => el.removeAttribute(attr),
        HIGHLIGHT_ATTRIBUTE
      );
    }
  }

  return file;
};

export type RecordVideoOptions = Pick<
  BrowserContextOptions,
  | 'storageState'
  | 'baseURL'
  | 'viewport'
  | 'isMobile'
  | 'hasTouch'
  | 'deviceScaleFactor'
  | 'userAgent'
  | 'locale'
  | 'timezoneId'
  | 'colorScheme'
>;

/**
 * Records a flow as a video and saves it as
 * `apps/docs/src/assets/videos/<name>.webm` (`<name>-mobile.webm` on mobile).
 *
 * The flow runs in a new browser context (recording can only be enabled when a
 * context is created), so pass the session (`storageState`) and device settings
 * it needs. Keep flows short: a few seconds, one task.
 */
export const recordVideo = async (
  browser: Browser,
  name: string,
  options: RecordVideoOptions,
  flow: (page: Page) => Promise<void>
) => {
  const file = path.join(DOCS_VIDEOS_DIR, `${assetName(name)}.webm`);
  const tmpDir = test.info().outputPath('docs-video');
  const size = options.viewport ?? { width: 1280, height: 720 };

  const context = await browser.newContext({
    ...options,
    viewport: size,
    recordVideo: { dir: tmpDir, size },
  });
  const page = await context.newPage();
  const video = page.video()!;

  try {
    await flow(page);
    // let the last state be visible for a moment
    await page.waitForTimeout(1_000);
  } finally {
    await context.close();
  }

  await mkdir(DOCS_VIDEOS_DIR, { recursive: true });
  await video.saveAs(file);
  await video.delete();
  await rm(tmpDir, { recursive: true, force: true });

  return file;
};
