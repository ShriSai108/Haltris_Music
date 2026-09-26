import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './app/App';
import { NOT_FOUND_PATH, prerenderRoutes, render } from './entry-server';

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('prerendering', () => {
  it.each([...prerenderRoutes, NOT_FOUND_PATH])('renders %s to real HTML that hydrates without mismatches', async (route) => {
    const { html, head } = render(route);
    expect(html).toContain('<main');
    expect(head).toContain('<title>');

    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const recoverable = vi.fn();
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.append(container);

    await act(async () => {
      hydrateRoot(
        container,
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>,
        { onRecoverableError: recoverable },
      );
    });

    expect(recoverable).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
  });
});
