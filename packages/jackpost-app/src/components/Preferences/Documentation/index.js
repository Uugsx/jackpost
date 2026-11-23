import React from 'react';
import StyledWrapper from './StyledWrapper';
import { DOCUMENTATION_SECTIONS } from './sections';

const Block = ({ block }) => {
  if (block.text) return <p>{block.text}</p>;
  if (block.code) return <pre><code>{block.code}</code></pre>;
  return (
    <ul>
      {block.list.map((entry) => <li key={entry}>{entry}</li>)}
    </ul>
  );
};

const Documentation = () => (
  <StyledWrapper className="w-full" data-testid="documentation">
    <div className="section-header">Документация</div>
    <nav className="docs-nav" aria-label="Разделы документации">
      {DOCUMENTATION_SECTIONS.map(({ id, title }) => (
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
    {DOCUMENTATION_SECTIONS.map(({ id, title, blocks }) => (
      <section key={id} id={`docs-${id}`} className="docs-section">
        <h3>{title}</h3>
        {blocks.map((block, index) => <Block key={index} block={block} />)}
      </section>
    ))}
  </StyledWrapper>
);

export default Documentation;
