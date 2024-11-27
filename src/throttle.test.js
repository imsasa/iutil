
import { jest } from '@jest/globals';

import { throttle, debounce } from './throttle.js';
describe('throttle', () => {
  jest.useFakeTimers();

  it('should throttle function calls', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, { delay: 1000 });
    throttledFn();
    throttledFn();
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);
    // Fast-forward time 1000ms
    jest.advanceTimersByTime(1000);
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it(' not handle immediate option correctly', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, { delay: 1000, immediate: false });
    throttledFn();
    throttledFn();
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('debounce', () => {
  jest.useFakeTimers();
  it('should debounce function calls', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, { delay: 1000 });
    debouncedFn();
    debouncedFn();
    debouncedFn();
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle immediate option correctly', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, { delay: 1000, immediate: true });
    debouncedFn();
    debouncedFn();
    debouncedFn();
    expect(fn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);
    debouncedFn();

    expect(fn).toHaveBeenCalledTimes(2);
  });
});