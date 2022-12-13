import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => new Response('OK');
