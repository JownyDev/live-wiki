import type { APIRoute } from 'astro';
import { buildSearchIndex } from '../../lib/content/search';
import { languages } from '../../i18n/ui';

export function getStaticPaths() {
  return Object.keys(languages).map((lang) => ({ params: { lang } }));
}

export const prerender = true;

export const GET: APIRoute = async ({ params }) => {
  const { lang } = params;
  const index = await buildSearchIndex(undefined, lang);
  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
