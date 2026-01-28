import { describe, it, expect } from 'vitest';
import sanitizeHtml from 'sanitize-html';

describe('XSS Protection Configuration', () => {
  // This configuration must match the one in src/components/MarkdownDescription.astro
  const config = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height'],
    },
  };

  it('strips script tags', () => {
    const dirty = '<div><script>alert(1)</script>Hello</div>';
    const clean = sanitizeHtml(dirty, config);
    expect(clean).toBe('<div>Hello</div>');
  });

  it('preserves headers and images', () => {
    const content = '<h1>Title</h1><img src="x.jpg" alt="test" />';
    const clean = sanitizeHtml(content, config);
    expect(clean).toBe('<h1>Title</h1><img src="x.jpg" alt="test" />');
  });
  
  it('strips onclick attributes', () => {
      const dirty = '<a href="#" onclick="alert(1)">Click me</a>';
      const clean = sanitizeHtml(dirty, config);
      expect(clean).toBe('<a href="#">Click me</a>');
  });
});
