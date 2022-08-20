<script lang="ts">
	import { useDistance } from './time';

	export let to: Date | number;
	const distance = useDistance(to);
</script>

<time datetime={new Date(to).toLocaleString()}>{$distance}</time>
