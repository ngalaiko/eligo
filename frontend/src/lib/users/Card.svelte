<script lang="ts">
	import type { User } from '@eligo/protocol';
	export let user: User & { id: string };
</script>

<div id={user.id}>
	<b>{user.name}</b>
</div>
