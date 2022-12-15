<script>
	import { connected } from '$lib/api';
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width="10"
	height="10"
	viewBox="0 0 24 24"
	stroke-width="1"
	stroke="transparent"
	fill="none"
	stroke-linecap="round"
	stroke-linejoin="round"
	class:fill-green={$connected}
	class:fill-red={!$connected}
>
	<circle cx="12" cy="12" r="11" />
</svg>
