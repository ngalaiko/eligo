<script lang="ts">
	import '../app.postcss';
	import { Context } from '$lib/logux';
</script>

<Context>
	<main class="w-screen h-screen p-4">
		<slot />
	</main>
</Context>
