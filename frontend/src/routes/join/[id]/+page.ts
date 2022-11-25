import { http, HTTPError } from '$lib/api';
import type { PageLoad } from '.svelte-kit/types/src/routes/lists/[id]/history/$types';
import { redirect } from '@sveltejs/kit';

export const prerender = false;

export const load: PageLoad = ({ params, fetch }) =>
    http({ fetch })
        .join({ invitationId: params.id })
        .then((membership) => {
            throw redirect(301, `/lists/${membership.listId}/items/`);
        })
        .catch((err) => {
            if (err instanceof HTTPError) {
                return new Response(err.message, { status: err.status });
            } else {
                throw err;
            }
        });
