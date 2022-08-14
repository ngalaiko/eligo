<script lang="ts">
	import { page } from '$app/stores';
	import { useList } from '$lib/lists';

	$: list = $page.params.id ? useList($page.params.id) : undefined;
</script>

<ul>
	{#if !list}
		<li><a href="/lists/">lists</a></li>
	{:else if $list.isLoading}
		<li><a href="/lists/">lists</a></li>
		<li>/</li>
		<li>...</li>
	{:else if $list.isLoading === false}
		<li><a href="/lists/">lists</a></li>
		<li>/</li>
		<li><a href="/lists/{$list.id}">{$list.title}</a></li>
	{/if}
</ul>
<slot />
