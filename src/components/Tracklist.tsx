import type { EditorialPillar } from '../content/site';

interface TracklistProps {
  items: readonly EditorialPillar[];
  side?: string;
}

/** The method, laid out like the back of a record sleeve. */
export function Tracklist({ items, side = 'Side A' }: TracklistProps) {
  return (
    <div className="tracklist" data-reveal>
      <div className="tracklist__head" aria-hidden="true">
        <span>{side}</span>
        <span>{items.length} tracks</span>
      </div>
      <ol className="tracklist__list" data-reveal="stagger">
        {items.map((item) => (
          <li className="tracklist__item" key={item.number}>
            <span className="tracklist__number" aria-hidden="true">
              <span className="tracklist__digits">{item.number}</span>
              <span className="tracklist__bars">
                <span />
                <span />
                <span />
                <span />
              </span>
            </span>
            <h3 className="tracklist__title">{item.title}</h3>
            <p className="tracklist__text">{item.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
