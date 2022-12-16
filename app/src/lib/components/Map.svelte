<script lang="ts">
	import type { Map, Marker } from 'leaflet';

	type Item = { coordinates: [number, number]; title: string };

	export let items: Item[];

	const average = (array: number[]) =>
		array.length > 0 ? array.reduce((a, b) => a + b) / array.length : 0;

	$: center = [
		average(items.map(({ coordinates }) => coordinates[0])),
		average(items.map(({ coordinates }) => coordinates[1]))
	] as [number, number];

	const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	const map = (container: HTMLElement, items: Item[]) => {
		let map: Map;
		const shouldSleep = container.parentElement?.id === 'animation';

		let done: () => void;
		const init = new Promise<void>((resolve) => (done = resolve));

		const l = import('leaflet');

		const marker = async ({ title, coordinates }: Item) => {
			const L = await l;

			const markerIcon = () =>
				L.divIcon({
					html: `<svg xmlns="http://www.w3.org/2000/svg" class="fill-orange" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M5 14h14l-4.5 -4.5l4.5 -4.5h-14v16" />
</svg>`,
					className: 'map-marker'
				});

			return L.marker(coordinates, {
				icon: markerIcon(),
				title,
				alt: title,
				riseOnHover: true
			}).bindPopup([`<b>${title}</b>`].join('<br/>'));
		};

		const markers: Record<string, Marker> = {};
		const syncMarkers = (items: Item[]) => {
			const itemId = ({ title, coordinates }: Item) =>
				`${title}-${coordinates[0]}-${coordinates[1]}`;

			const ids = new Set(items.map(itemId));

			// remove non existent markers
			Object.entries(markers).forEach(([id, marker]) => {
				if (!ids.has(id)) {
					marker.remove();
					delete markers[id];
				}
			});

			// add new markers
			items.forEach(async (item) => {
				const id = itemId(item);
				if (markers[id]) return;
				const m = await marker(item);
				m.addTo(map);
				markers[id] = m;
			});
		};

		import('leaflet/dist/leaflet.css')
			.then(() => (shouldSleep ? sleep(150) : undefined))
			.then(async () => {
				const L = await l;
				map = L.map(container, { zoom: 12, center });

				L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
					attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>, &copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`,
					subdomains: 'abcd',
					maxZoom: 20
				}).addTo(map);

				done();

				syncMarkers(items);
			});

		return {
			update: (items: Item[]) =>
				init.then(() => {
					syncMarkers(items);
					map.setView(center, undefined, { animate: false });
				}),
			destroy: () => map.remove()
		};
	};
</script>

<div class="h-full w-full" use:map={items} />
