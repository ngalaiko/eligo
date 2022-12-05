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

	const map = (container: HTMLElement, items: Item[]) => {
		let map: Map;

		let done: () => void;
		const init = new Promise<void>((resolve) => (done = resolve));

		const l = import('leaflet');

		const marker = async ({ title, coordinates }: Item) => {
			const L = await l;

			const markerIcon = () =>
				L.divIcon({
					html: `<div class="bg-orange-500 h-4 w-4 opacity-50 rounded-full" />`,
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
					marker.removeFrom(map);
					delete markers[id];
				}
			});

			// add new markers
			items.forEach(async (item) => {
				const id = itemId(item);
				const m = await marker(item);
				m.addTo(map);
				markers[id] = m;
			});
		};

		import('leaflet/dist/leaflet.css').then(async () => {
			const L = await l;
			map = L.map(container, { zoom: 12, center });

			// use carto maps as a base layer
			L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
				attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>, &copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`,
				subdomains: 'abcd',
				maxZoom: 16
			}).addTo(map);

			done();

			syncMarkers(items);
		});

		return {
			update: (items: Item[]) =>
				init.then(() => {
					syncMarkers(items);
					map.flyTo(center, undefined, { animate: false });
				}),
			destroy: () => map.remove()
		};
	};
</script>

<div class="h-full w-full" use:map={items} />
