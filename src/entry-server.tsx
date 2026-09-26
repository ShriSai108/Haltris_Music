import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { App } from './app/App';
import { renderHeadTags } from './app/metadata';
import './styles/global.css';

export { prerenderRoutes, NOT_FOUND_PATH, renderRobots, renderSitemap } from './app/metadata';

/** Renders one route to HTML for the prerender step. */
export function render(pathname: string) {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={pathname}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );

  return { html, head: renderHeadTags(pathname) };
}
