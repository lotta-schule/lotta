export class ResizeObserverPolyfill implements ResizeObserver {
  disconnect() {}
  observe(_target: Element, _options?: ResizeObserverOptions) {}
  unobserve(_target: Element) {}
}
