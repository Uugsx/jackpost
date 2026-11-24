import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import themes from 'themes/index';
import Documentation from './index';
import { DOCUMENTATION_SECTIONS_EN } from './sections.en';
import { DOCUMENTATION_SECTIONS_RU } from './sections.ru';

i18n.use(initReactI18next).init({ lng: 'en', resources: {} });

const renderDocs = () => {
  const theme = Object.values(themes)[0];
  return render(
    <ThemeProvider theme={theme.light || theme}>
      <Documentation />
    </ThemeProvider>
  );
};

describe('Documentation', () => {
  it('has the same sections in both languages', () => {
    expect(DOCUMENTATION_SECTIONS_RU.map((s) => s.id)).toEqual(DOCUMENTATION_SECTIONS_EN.map((s) => s.id));
  });

  it.each([
    ['en', DOCUMENTATION_SECTIONS_EN],
    ['ru', DOCUMENTATION_SECTIONS_RU]
  ])('renders %s sections without external links', async (language, sections) => {
    await i18n.changeLanguage(language);
    const { container } = renderDocs();
    sections.forEach(({ title }) => {
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    });
    expect(container.querySelectorAll('a[href]')).toHaveLength(0);
  });
});
