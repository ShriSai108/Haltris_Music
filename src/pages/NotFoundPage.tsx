import { Link } from 'react-router-dom';
import { markBlocks } from '../components/BlockMark';

export function NotFoundPage() {
  return (
    <main className="page">
      <section className="not-found">
        <svg className="not-found__blocks" viewBox="10 10 44 44" aria-hidden="true" focusable="false">
          {markBlocks.map((block) => (
            <rect key={`${block.x}-${block.y}`} className="not-found__block" rx="1.4" {...block} />
          ))}
        </svg>
        <p className="eyebrow">Error 404 · Track missing</p>
        <h1>We could not find that page.</h1>
        <p>It isn&rsquo;t on the record. The page may have moved, or the link skipped a beat.</p>
        <Link className="button button--primary button--lg" to="/" data-magnetic>
          <span>Back to the home page</span>
          <span className="button__arrow" aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
