import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const html = fs.readFileSync('index.html', 'utf8');
for (const [saved, system, expected] of [
  ['light', false, 'light'],
  ['dark', true, 'dark'],
  [null, true, 'light'],
  [null, false, 'dark'],
])
  test(`theme bootstrap before React: saved ${saved}, light preference ${system}`, () => {
    const executableHtml = html.replace(
      /<script src="\/theme-init\.js"><\/script>/,
      () => '<script>' + fs.readFileSync('public/theme-init.js', 'utf8') + '</script>'
    );
    const dom = new JSDOM(executableHtml, {
      url: 'http://localhost/',
      runScripts: 'dangerously',
      beforeParse(w) {
        w.matchMedia = () => ({ matches: system });
        if (saved) w.localStorage.setItem('bb.theme', saved);
      },
    });
    assert.equal(dom.window.document.documentElement.dataset.theme, expected);
    assert.equal(dom.window.document.documentElement.style.colorScheme, expected);
    dom.window.close();
  });
test('reload shell loads styles and Honey favicon before React, without a logo splash', () => {
  assert.ok(html.indexOf('/styles/tailwind.css') < html.indexOf('/src/main.jsx'));
  assert.match(html, /rel="icon"[^>]+honey-icon\.svg/);
  assert.match(html, /apple-touch-icon\.png/);
  const dom = new JSDOM(html);
  assert.equal(dom.window.document.querySelector('#root img'), null);
  assert.match(dom.window.document.querySelector('#root').textContent, /discovery is loading/);
  const ico = fs.readFileSync('public/favicon.ico');
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 1);
  dom.window.close();
});
