import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import themes from 'themes/index';
import Documentation from './index';
import { DOCUMENTATION_SECTIONS } from './sections';

describe('Documentation', () => {
  it('рендерит все разделы без внешних ссылок', () => {
    const theme = Object.values(themes)[0];
    const { container } = render(
      <ThemeProvider theme={theme.light || theme}>
        <Documentation />
      </ThemeProvider>
    );
    DOCUMENTATION_SECTIONS.forEach(({ title }) => {
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    });
    expect(container.querySelectorAll('a[href]')).toHaveLength(0);
  });
});
