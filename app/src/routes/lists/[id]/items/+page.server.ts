import type { Actions, PageServerLoad } from './$types';
import Api from '$lib/server/api';
import { error, fail } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { type Item, boosts, items } from '@eligo/protocol';

export const load: PageServerLoad = async ({ url, params, locals: { database }, parent }) => {
    const { items } = await parent();
    return {
        items,
        boosts: database.filter('boosts', { listId: params.id }),
        picks: database.filter('picks', { listId: params.id }),
        isEditing: url.searchParams.get('editing') === 'true'
    };
};

export const actions: Actions = {
    create: async ({ cookies, request, params, locals }) => {
        const { database } = locals;

        const user = await Api(locals).users.fromCookies(cookies);
        if (!user) throw error(404);

        const data = await request.formData();

        const text = data.get('text') as string;
        if (!text)
            return fail(400, {
                success: false,
                item: { id: undefined, coordinates: undefined, text: false },
                boost: undefined
            });

        const item: Item = {
            id: nanoid(),
            text,
            createTime: new Date().getTime(),
            userId: user.id,
            listId: params.id
        };

        await database.append(user.id, items.create(item));

        return { success: true, item, boost: undefined };
    },

    update: async ({ request, cookies, locals }) => {
        const api = Api(locals);
        const { database } = locals;

        const data = await request.formData();

        const id = data.get('id') as string;
        if (!id) throw error(404);

        const user = await api.users.fromCookies(cookies);
        if (!user) throw error(404);

        const item = await database.find('items', { id });
        if (!item) throw error(404);

        if (!(await api.items.hasAccess(user, item))) throw error(404);

        const patch: { text?: string; coordinates?: [number, number] | null; updateTime?: number } = {};

        const text = data.get('text') as string;
        if (text && text.length > 0 && text !== item.text) patch.text = text;

        const coordinates = data.get('coordinates') as string;
        if (coordinates) {
            const [long, lat] = coordinates.split(',');
            if (!long || !lat)
                return fail(400, {
                    success: false,
                    item: { id: item.id, coordinates: false },
                    boost: undefined
                });
            const longitude = parseFloat(long.trim());
            if (isNaN(longitude))
                return fail(400, {
                    success: false,
                    item: { id: item.id, coordinates: false },
                    boost: undefined
                });

            const latitude = parseFloat(lat.trim());
            if (isNaN(latitude))
                return fail(400, {
                    success: false,
                    item: { id: item.id, coordinates: false },
                    boost: undefined
                });

            patch.coordinates = [longitude, latitude];
        } else {
            patch.coordinates = null;
        }

        if (Object.keys(patch).length > 0) {
            patch.updateTime = new Date().getTime();
            await database.append(
                user.id,
                items.update({ id: item.id, ...patch, updateTime: patch.updateTime! })
            );
        }

        return { success: true, item: { ...item, ...patch }, boost: undefined };
    },

    delete: async ({ cookies, locals, request }) => {
        const api = Api(locals);
        const { database } = locals;

        const data = await request.formData();

        const id = data.get('id') as string;
        if (!id) throw error(404);

        const user = await api.users.fromCookies(cookies);
        if (!user) throw error(404);

        const item = await database.find('items', { id });
        if (!item) throw error(404);

        if (!(await api.items.hasAccess(user, item))) throw error(404);

        const patch = { id: item.id, deleteTime: new Date().getTime() };
        await database.append(user.id, items.delete(patch));

        return { success: true, item: { ...item, ...patch }, boost: undefined };
    },

    boost: async ({ request, cookies, locals }) => {
        const api = Api(locals);
        const { database } = locals;

        const data = await request.formData();

        const id = data.get('id') as string;
        if (!id) throw error(404);

        const user = await api.users.fromCookies(cookies);
        if (!user) throw error(404);

        const item = await database.find('items', { id });
        if (!item) throw error(404);

        if (!(await api.items.hasAccess(user, item))) throw error(404);

        const boost = {
            id: nanoid(),
            userId: user.id,
            itemId: item.id,
            listId: item.listId,
            createTime: new Date().getTime()
        };

        await database.append(user.id, boosts.create(boost));

        return { success: true, boost, item: undefined };
    }
};
