<script lang="ts">
	import type { User } from '@eligo/protocol';
	import { session } from '$app/stores';

	export let replaceSelf = true;
	export let user: User & { id: string };
</script>

<div id={user.id}>
	{replaceSelf && $session.user?.id === user.id ? 'you' : user.name}
</div>
