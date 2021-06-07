import { describe, expect, it } from '@jest/globals';

import { searchType } from '../src/search';
import { ltrim, tagHelper } from '../src/util';

describe('searchType', () => {
  it('should return matched search types ', () => {
    expect(searchType(1001)).toBe(1001);
    expect(searchType('1001')).toBe(1001);
    expect(searchType('userPlaylistItem')).toBe(1001);
    expect(() => searchType(777)).toThrowError();
  });
});

describe('tagHelper', () => {
  it('should build tag object', () => {
    expect(tagHelper('test', ['a', 'b'])).toEqual({
      'test.locked': 1,
      'test[0].tag.tag': 'a',
      'test[1].tag.tag': 'b',
    });
  });

  it('should build remove tag object', () => {
    expect(tagHelper('test', ['a', 'b'], undefined, true)).toEqual({
      'test.locked': 1,
      'test[].tag.tag-': 'a,b',
    });
  });

  it('should build unlocked tag object', () => {
    expect(tagHelper('test', ['a', 'b'], false)).toEqual({
      'test.locked': 0,
      'test[0].tag.tag': 'a',
      'test[1].tag.tag': 'b',
    });
  });
});

describe('ltrim', () => {
  it('should trim characters from the left of the string', () => {
    expect(ltrim('////hello', ['/'])).toBe('hello');
  });
});
