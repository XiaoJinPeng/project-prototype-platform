import { describe, expect, it } from 'vitest';

import { getClientDefaultPagePath } from '../../src/services/project-navigation.js';

function client(defaultPage, pages) {
  return { defaultPage, definition: { pages } };
}

describe('project navigation', () => {
  it('uses the configured default page when it exists', () => {
    expect(
      getClientDefaultPagePath(
        client('dashboard', [
          { path: 'orders', menu: true },
          { path: 'dashboard', menu: false },
        ]),
      ),
    ).toBe('dashboard');
  });

  it('falls back to the first menu page when defaultPage is empty', () => {
    expect(
      getClientDefaultPagePath(
        client('', [
          { path: 'imported-page', menu: true },
          { path: 'hidden-page', menu: false },
        ]),
      ),
    ).toBe('imported-page');
  });

  it('falls back to any route when all pages are hidden', () => {
    expect(getClientDefaultPagePath(client('missing', [{ path: 'hidden-page', menu: false }]))).toBe(
      'hidden-page',
    );
  });
});
