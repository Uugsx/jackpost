import { applyLanguage } from './dom-translator';

const flushFrames = () => new Promise((resolve) => window.requestAnimationFrame(() => resolve()));

describe('dom-translator', () => {
  afterEach(() => {
    applyLanguage({});
    document.body.innerHTML = '';
  });

  it('translates exact texts and attributes, and restores English', () => {
    document.body.innerHTML = '<div><span> Save </span><input placeholder="Search..."><span>My request</span></div>';
    applyLanguage({ 'Save': 'Сохранить', 'Search...': 'Поиск...' });

    expect(document.body.querySelector('span').textContent).toBe(' Сохранить ');
    expect(document.body.querySelector('input').getAttribute('placeholder')).toBe('Поиск...');
    expect(document.body.querySelectorAll('span')[1].textContent).toBe('My request');

    applyLanguage({});
    expect(document.body.querySelector('span').textContent).toBe(' Save ');
    expect(document.body.querySelector('input').getAttribute('placeholder')).toBe('Search...');
  });

  it('leaves code and opted-out regions untouched', () => {
    document.body.innerHTML = '<pre>Save</pre><div data-no-translate><span>Save</span></div>';
    applyLanguage({ Save: 'Сохранить' });
    expect(document.body.querySelector('pre').textContent).toBe('Save');
    expect(document.body.querySelector('[data-no-translate] span').textContent).toBe('Save');
  });

  it('translates nodes added and text changed after start', async () => {
    applyLanguage({ Send: 'Отправить', Cancel: 'Отмена' });
    const button = document.createElement('button');
    button.textContent = 'Send';
    document.body.appendChild(button);
    await Promise.resolve();
    await flushFrames();
    expect(button.textContent).toBe('Отправить');

    button.firstChild.nodeValue = 'Cancel';
    await Promise.resolve();
    await flushFrames();
    expect(button.textContent).toBe('Отмена');
  });
});
