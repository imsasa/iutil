import { jest } from '@jest/globals';
import observe from './observe';

describe('observe', () => {
  let obj;
  beforeEach(() => {
    obj = { name: 'sasa', age: 30, sub: { n: 'n' } };
  });

  test('should observe changes to object properties', () => {
    const callback = jest.fn();
    const unobserve = observe(obj, callback);

    obj.name = 'evan';
    expect(callback).toHaveBeenCalledWith('evan', 'name', obj);

    obj.age = 31;
    expect(callback).toHaveBeenCalledWith(31, 'age', obj);

    unobserve();
  });

  test('should observe changes to nested object properties when deep is true', () => {
    const callback = jest.fn();
    const unobserve = observe(obj, callback, true);

    obj.sub.n = 'evan';
    expect(callback).toHaveBeenCalledWith('evan', 'sub.n', obj.sub);
    unobserve();
  });

  test('should not observe changes after unobserve is called', () => {
    const callback = jest.fn();
    const unobserve = observe(obj, callback);

    unobserve();
    obj.name = 'evan';
    expect(callback).not.toHaveBeenCalled();
  });

  test('should handle multiple observers', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const unobserve1 = observe(obj, callback1);
    const unobserve2 = observe(obj, callback2);

    obj.name = 'evan';
    expect(callback1).toHaveBeenCalledWith('evan', 'name', obj);
    expect(callback2).toHaveBeenCalledWith('evan', 'name', obj);

    unobserve1();
    obj.age = 31;
    expect(callback1).not.toHaveBeenCalledWith(31, 'age', obj);
    expect(callback2).toHaveBeenCalledWith(31, 'age', obj);

    unobserve2();
  });
});