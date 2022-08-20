<script lang="ts">
	import { useDistance } from './time';

	export let to: Date | number;
	const distance = useDistance(to);
	const datetime = new Date(to).toLocaleString();
</script>

<time class="whitespace-nowrap" title={datetime} {datetime}>{$distance}</time>
