import { translate } from '@/utils/translate';
import { describe, expect, it } from 'bun:test';

describe('Utils', () => {
  it('translate', async () => {
    const res = await translate('água');
    expect(res).toBe('water');
  });
});