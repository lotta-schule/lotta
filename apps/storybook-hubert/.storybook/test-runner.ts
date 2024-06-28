import { getStoryContext } from '@storybook/test-runner';
import { Page } from 'playwright';

module.exports = {
  async preVisit(
    page: Page,
    story: {
      id: string;
      title: string;
      name: string;
    }
  ) {
    const context = await getStoryContext(page, story);
    const viewPortParams = context.parameters?.viewport;
    const defaultViewport = viewPortParams?.defaultViewport;
    const viewport: Record<string, string> | undefined =
      defaultViewport && viewPortParams.viewports[defaultViewport].styles;

    const parsedViewportSizes =
      viewport &&
      Object.entries(viewport).reduce(
        (acc, [screen, size]) => ({
          ...acc,
          [screen]: parseInt(size),
        }),
        {} as any
      );

    if (parsedViewportSizes) {
      page.setViewportSize(parsedViewportSizes);
    }
  },
};
