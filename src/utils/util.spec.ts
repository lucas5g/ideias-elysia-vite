import { describe, expect, it } from 'bun:test';
import { gemini } from './gemini';

describe('Utils', () => {
  it('gemini', async () => {
    const res = await gemini('água');
    expect(res).toBe('water');
  });
});