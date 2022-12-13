<script>
	export let items = [];
</script>

<ul class="overflow-y-scroll flex flex-col gap-2 -mr-3 h-full">
	{#each items as item (item.id)}
		<li class="mr-3">
			<slot {item} />
		</li>
	{:else}
		<li class="flex h-full">
			<span class="text-4xl opacity-50 font-semibold m-auto">empty.</span>
		</li>
	{/each}
</ul>
