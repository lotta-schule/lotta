export class MockRouter {
  public _pathname = '/';

  public _as: string | undefined = undefined;

  public get asPath() {
    return this._as || this._pathname;
  }

  public _emitter = new (class<
    T extends any[],
    Fn extends (...arg: T) => void,
  > {
    _callbacks = new Map<string, Fn[]>();
    _on(event: string, callback: Fn) {
      this._callbacks.set(event, [
        ...(this._callbacks.get(event) || []),
        callback,
      ]);
    }
    _off(event: string, callback: Fn) {
      if (this._callbacks.has(event)) {
        this._callbacks.set(
          event,
          (this._callbacks.get(event) as Fn[]).filter((cb) => cb !== callback)
        );
      }
    }
    _emit(event: string, ...args: T) {
      this._callbacks.get(event)?.forEach((cb) => cb(...args));
    }
    clear() {
      this._callbacks.clear();
    }
    on = vi.fn(this._on.bind(this));
    off = vi.fn(this._off.bind(this));
    emit = vi.fn(this._emit.bind(this));
  })();
  public _history = new Set<string>(this._pathname);
  public _push = vi.fn(
    async (_pathname: string, _as = _pathname, _options?: any) => {
      this._pathname = _pathname;
      this._as = _as;
      this._history.add(_pathname);
      this._emitter.emit('routeChangeStart', _pathname);
      this._emitter.emit('routeChangeComplete', _pathname);
      this._emitter.emit('routeChangeEnd', _pathname);
      return true;
    }
  );

  reset(pathname = '/') {
    this._emitter.clear();
    this._history.clear();
    this._push.mockClear();
    this._pathname = pathname;
    this._history.add(pathname);
  }

  push(pathname: string, asPath: string = pathname, options?: any) {
    this._push(pathname, asPath, options);
    this._pathname = pathname;
    this._history.add(pathname);
    this._emitter.emit('routeChangeStart', pathname);
    this._emitter.emit('routeChangeComplete', pathname);
    this._emitter.emit('routeChangeEnd', pathname);
  }

  refresh: () => void = vi.fn();

  events = this._emitter;
}
