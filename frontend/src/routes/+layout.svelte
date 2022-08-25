<script lang="ts">
	import '../app.postcss';
	import { Context } from '$lib/logux';
</script>

<Context>
	<main class="max-w-lg h-screen p-4 mx-auto">
		<slot />
	</main>
</Context>
