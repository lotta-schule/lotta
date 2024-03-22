import { TextEncoder } from 'util';
import '@jest/globals';
import '@testing-library/jest-dom';
import 'whatwg-fetch';

// create setup document
const dialogContainer = document.createElement('div');
dialogContainer.setAttribute('id', 'dialogContainer');
document.body.appendChild(dialogContainer);

// window.matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Element.prototype.scroll = jest.fn();
Object.defineProperty(window, 'scrollTo', {
  writable: false,
  value: jest.fn(),
});

global.TextEncoder = TextEncoder;

const originalError = console.error;
jest.spyOn(console, 'error').mockImplementation((...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('inside a test was not wrapped in act')
  ) {
    return;
  }
  return originalError.call(console, args);
});
