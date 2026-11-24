import React from 'react';
import { useTranslation } from 'react-i18next';
import StyledWrapper from './StyledWrapper';
import { DOCUMENTATION_SECTIONS_EN } from './sections.en';
import { DOCUMENTATION_SECTIONS_RU } from './sections.ru';

const SECTIONS_BY_LANGUAGE = { en: DOCUMENTATION_SECTIONS_EN, ru: DOCUMENTATION_SECTIONS_RU };
const HEADINGS = { en: 'Documentation', ru: 'Документация' };

const Block = ({ block }) => {
  if (block.text) return <p>{block.text}</p>;
  if (block.code) return <pre><code>{block.code}</code></pre>;
  return (
    <ul>
      {block.list.map((entry) => <li key={entry}>{entry}</li>)}
    </ul>
  );
};

const Documentation = () => {
  const { i18n } = useTranslation();
  const language = SECTIONS_BY_LANGUAGE[i18n.language] ? i18n.language : 'en';
  const sections = SECTIONS_BY_LANGUAGE[language];

  // Docs ship in both languages, so the interface translator must leave them alone
  return (
    <StyledWrapper className="w-full" data-testid="documentation" data-no-translate>
      <div className="section-header">{HEADINGS[language]}</div>
      <nav className="docs-nav" aria-label={HEADINGS[language]}>
        {sections.map(({ id, title }) => (
          <button
            key={id}
            type="button"
            className="docs-nav-link"
            onClick={() => document.getElementById(`docs-${id}`).scrollIntoView({ behavior: 'smooth' })}
          >
            {title}
          </button>
        ))}
      </nav>
      {sections.map(({ id, title, blocks }) => (
        <section key={id} id={`docs-${id}`} className="docs-section">
          <h3>{title}</h3>
          {blocks.map((block, index) => <Block key={index} block={block} />)}
        </section>
      ))}
    </StyledWrapper>
  );
};

export default Documentation;
