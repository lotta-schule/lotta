import { TextEncoder } from 'util';
import '@testing-library/jest-dom/vitest';

// create setup document
const dialogContainer = document.createElement('div');
dialogContainer.setAttribute('id', 'dialogContainer');
document.body.appendChild(dialogContainer);

// window.matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Element.prototype.scroll = vi.fn(() => void 0);
Object.defineProperty(window, 'scrollTo', {
  writable: false,
  value: vi.fn(),
});

global.TextEncoder = TextEncoder;

const originalError = console.error;
vi.spyOn(console, 'error').mockImplementation((...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('inside a test was not wrapped in act')
  ) {
    return;
  }
  return originalError.call(console, args);
});
