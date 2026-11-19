// XML helpers for the SOAP request editor: validate, format and repair "broken" XML.

const ENTITY_RE = /&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g;

/** Returns { valid, message, line } using the browser's XML parser. */
export const validateXml = (xml) => {
  if (typeof xml !== 'string' || !xml.trim()) return { valid: true, message: '', line: null };
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const err = doc.getElementsByTagName('parsererror')[0];
  if (!err) return { valid: true, message: '', line: null };
  const text = (err.textContent || '').trim();
  const lineMatch = /line\s*(?:number\s*)?(\d+)/i.exec(text);
  const message = text.split('\n').find((l) => /error|expected|mismatch|unclosed|invalid/i.test(l)) || text.split('\n')[0];
  return { valid: false, message: message.trim(), line: lineMatch ? Number(lineMatch[1]) : null };
};

const TOKEN_RE = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<![^>]*>|<\/?[A-Za-z_][^\s/>]*(?:"[^"]*"|'[^']*'|[^>"'])*>|[^<]+|</g;

const fixAttributes = (tag) =>
  // quote bare attribute values: a=b -> a="b"; leave quoted ones untouched
  tag.replace(/(\s[\w:.-]+)=([^\s"'>/][^\s>/]*)/g, '$1="$2"');

/**
 * Best-effort repair: closes unclosed tags, drops/auto-closes mismatched closing tags,
 * escapes stray "&", quotes bare attribute values, strips text before the first tag.
 * Returns { xml, changed }. The result is only returned if it parses; otherwise the original is kept.
 */
export const repairXml = (input) => {
  if (typeof input !== 'string') return { xml: input, changed: false };
  let src = input.replace(/^﻿/, '');
  const firstLt = src.indexOf('<');
  if (firstLt > 0) src = src.slice(firstLt);

  const out = [];
  const stack = [];
  const tokens = src.match(TOKEN_RE) || [];

  for (const tok of tokens) {
    if (tok === '<') {
      out.push('&lt;');
    } else if (tok.startsWith('<!--') || tok.startsWith('<![CDATA[') || tok.startsWith('<?') || tok.startsWith('<!')) {
      out.push(tok);
    } else if (tok.startsWith('</')) {
      const name = tok.slice(2, -1).trim();
      const idx = stack.lastIndexOf(name);
      if (idx === -1) continue; // stray closing tag
      while (stack.length - 1 > idx) out.push(`</${stack.pop()}>`);
      stack.pop();
      out.push(`</${name}>`);
    } else if (tok.startsWith('<')) {
      const fixed = fixAttributes(tok);
      const selfClosing = /\/\s*>$/.test(fixed);
      const name = /^<([^\s/>]+)/.exec(fixed)[1];
      if (!selfClosing) stack.push(name);
      out.push(fixed);
    } else {
      out.push(tok.replace(ENTITY_RE, '&amp;'));
    }
  }
  while (stack.length) out.push(`</${stack.pop()}>`);

  const xml = out.join('');
  if (xml === input) return { xml: input, changed: false };
  return validateXml(xml).valid ? { xml, changed: true } : { xml: input, changed: false };
};

/** Pretty-prints well-formed XML with 2-space indentation; returns the input if it is invalid. */
export const formatXml = (xml) => {
  if (!validateXml(xml).valid || !xml.trim()) return xml;
  const tokens = xml.replace(/>\s+</g, '><').trim().match(/<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<[^>]+>|[^<]+/g) || [];
  const lines = [];
  let depth = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const isClose = t.startsWith('</');
    const isOpen = /^<[^/!?]/.test(t) && !/\/>$/.test(t);
    if (isClose) depth = Math.max(0, depth - 1);
    // keep simple <a>text</a> on one line
    if (isOpen && tokens[i + 1] && !tokens[i + 1].startsWith('<') && tokens[i + 2] && tokens[i + 2].startsWith('</')) {
      lines.push('  '.repeat(depth) + t + tokens[i + 1].trim() + tokens[i + 2]);
      i += 2;
      continue;
    }
    lines.push('  '.repeat(depth) + t.trim());
    if (isOpen) depth++;
  }
  return lines.join('\n');
};
