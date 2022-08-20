<script lang="ts">
	import { page } from '$app/stores';
	import { useList } from '$lib/lists';

	$: list = $page.params.id ? useList($page.params.id) : undefined;
</script>

<svelte:head>
	{#if !list}
		<title>Lists</title>
	{:else if $list.isLoading === false}
		<title>{$list.title}</title>
	{/if}
</svelte:head>

<ul class="p-2 my-4 flex gap-2 bg-yellow-100 rounded-md border-2 border-black">
	{#if !list}
		<li><a class="underline" href="/lists/">lists</a></li>
	{:else if $list.isLoading}
		<li><a class="underline" href="/lists/">lists</a></li>
		<li>></li>
		<li>...</li>
	{:else if $list.isLoading === false}
		<li><a class="underline" href="/lists/">lists</a></li>
		<li>></li>
		<li><a class="underline" href="/lists/{$list.id}">{$list.title}</a></li>
	{/if}
</ul>

<slot />
