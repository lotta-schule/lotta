import * as React from 'react';
import { render, waitFor } from '../../test-utils';
import { SplitView } from './SplitView';
import { SplitViewButton } from './SplitViewButton';
import { SplitViewContent } from './SplitViewContent';
import { SplitViewNavigation } from './SplitViewNavigation';
import userEvent from '@testing-library/user-event';

describe('SplitView', () => {
  describe('desktop', () => {
    it('should render both navigation and content', () => {
      const screen = render(
        <SplitView>
          <SplitViewNavigation>
            <div>Navigation</div>
          </SplitViewNavigation>
          <SplitViewContent>
            <div>Content</div>
          </SplitViewContent>
        </SplitView>
      );

      expect(screen.getByText('Navigation')).not.toHaveAttribute(
        'aria-hidden',
        'true'
      );
    });

    it('should not render open / close buttons', () => {
      const screen = render(
        <SplitView>
          <SplitViewNavigation>
            <SplitViewButton action={'open'}>Open</SplitViewButton>
            <SplitViewButton action={'close'}>Close</SplitViewButton>
            <div>Navigation</div>
          </SplitViewNavigation>
          <SplitViewContent>
            <div>Content</div>
          </SplitViewContent>
        </SplitView>
      );

      expect(screen.queryByRole('button', { name: 'Open' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    });
  });

  describe('mobile', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => {
          const listeners: Function[] = [];
          return {
            matches: true,
            media: query,
            onchange: null,
            addListener: (listener: Function) => listeners.push(listener),
            removeListener: (listener: Function) =>
              listeners.splice(listeners.indexOf(listener), 1),
            addEventListener: (listener: Function) => listeners.push(listener),
            removeEventListener: (listener: Function) =>
              listeners.splice(listeners.indexOf(listener), 1),
            dispatchEvent: () => {
              listeners.forEach((listener) => listener('change'));
            },
          };
        }),
      });
    });
    afterEach(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => {
          const listeners: Function[] = [];
          return {
            matches: false,
            media: query,
            onchange: null,
            addListener: (listener: Function) => listeners.push(listener),
            removeListener: (listener: Function) =>
              listeners.splice(listeners.indexOf(listener), 1),
            addEventListener: (listener: Function) => listeners.push(listener),
            removeEventListener: (listener: Function) =>
              listeners.splice(listeners.indexOf(listener), 1),
            dispatchEvent: () => {
              listeners.forEach((listener) => listener('change'));
            },
          };
        }),
      });
    });

    it('should render only sidebar', async () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => {
          const listeners: Function[] = [];
          return {
            matches: true,
            media: query,
            onchange: null,
            addListener: (listener: Function) => listeners.push(listener),
            removeListener: (listener: Function) =>
              listeners.splice(listeners.indexOf(listener), 1),
            addEventListener: (listener: Function) => listeners.push(listener),
            removeEventListener: (listener: Function) =>
              listeners.splice(listeners.indexOf(listener), 1),
            dispatchEvent: () => {
              listeners.forEach((listener) => listener('change'));
            },
          };
        }),
      });

      const screen = render(
        <SplitView>
          <SplitViewNavigation>
            <div>Navigation</div>
          </SplitViewNavigation>
          <SplitViewContent>
            <div>Content</div>
          </SplitViewContent>
        </SplitView>
      );

      document.dispatchEvent(new Event('change'));
      await waitFor(() => {
        expect(screen.getByRole('complementary')).not.toHaveAttribute(
          'aria-hidden',
          'true'
        );
      });
    });

    it('should render only content if defaultSidebarVisible is false', async () => {
      const screen = render(
        <SplitView defaultSidebarVisible={false}>
          <SplitViewNavigation>
            <div>Navigation</div>
          </SplitViewNavigation>
          <SplitViewContent>
            <div>Content</div>
          </SplitViewContent>
        </SplitView>
      );

      document.dispatchEvent(new Event('change'));
      await waitFor(() => {
        expect(screen.queryByText('Navigation')?.parentElement).toHaveAttribute(
          'aria-hidden',
          'true'
        );
      });
    });

    it('should close sidebar on SplitViewButton click', async () => {
      userEvent.setup();
      const screen = render(
        <SplitView>
          <SplitViewNavigation>
            <SplitViewButton action={'close'}>Close</SplitViewButton>
            <div>Navigation</div>
          </SplitViewNavigation>
          <SplitViewContent>
            <div>Content</div>
          </SplitViewContent>
        </SplitView>
      );

      document.dispatchEvent(new Event('change'));
      await waitFor(() => {
        expect(
          screen.queryByText('Navigation')?.parentElement
        ).not.toHaveAttribute('aria-hidden', 'true');
      });
      await userEvent.click(screen.getByText('Close'));
      await waitFor(() => {
        expect(screen.queryByText('Navigation')?.parentElement).toHaveAttribute(
          'aria-hidden',
          'true'
        );
      });
    });

    it('not show close button when closeCondition is false', async () => {
      const screen = render(
        <SplitView closeCondition={() => false}>
          <SplitViewNavigation>
            <SplitViewButton action={'close'}>Close</SplitViewButton>
            <div>Navigation</div>
          </SplitViewNavigation>
          <SplitViewContent>
            <div>Content</div>
          </SplitViewContent>
        </SplitView>
      );

      document.dispatchEvent(new Event('change'));
      await new Promise((resolve) => setTimeout(resolve, 100)); // wait for change to propagate

      expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    });

    it('not show open button when openCondition is false', async () => {
      const screen = render(
        <SplitView defaultSidebarVisible={true} closeCondition={() => false}>
          <SplitViewNavigation>
            <SplitViewButton action={'open'}>Open</SplitViewButton>
            <div>Navigation</div>
          </SplitViewNavigation>
          <SplitViewContent>
            <div>Content</div>
          </SplitViewContent>
        </SplitView>
      );

      document.dispatchEvent(new Event('change'));
      await new Promise((resolve) => setTimeout(resolve, 100)); // wait for change to propagate

      expect(screen.queryByRole('button', { name: 'Open' })).toBeNull();
    });
  });
});
