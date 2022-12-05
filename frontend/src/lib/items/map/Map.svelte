<script lang="ts">
	import type { Item } from '@eligo/protocol';
	import L from 'leaflet';
	import Popup from './Popup.svelte';

	export let items: Array<Item>;

	// Vasastan / Kungsholmen
	const initialView = [59.3383121, 18.0394608];

	const markerIcon = () => {
		return L.divIcon({
			html: `<div class="bg-orange-500 h-4 w-4 opacity-50 rounded-full"</div>`,
			className: 'map-marker'
		});
	};

	const createMarker = (item: Item) => {
		const icon = markerIcon();
		const marker = L.marker(item.coordinates, { icon });
		bindPopup(marker, (m) => {
			return new Popup({
				target: m,
				props: {
					item: item
				}
			});
		});

		return marker;
	};

	const bindPopup = (marker, createFn) => {
		let popupComponent;
		marker.bindPopup(() => {
			let container = L.DomUtil.create('div');
			popupComponent = createFn(container);
			return container;
		});

		marker.on('popupclose', () => {
			if (popupComponent) {
				let old = popupComponent;
				popupComponent = null;
				// Wait to destroy until after the fadeout completes.
				setTimeout(() => {
					old.$destroy();
				}, 500);
			}
		});
	};

	const createMap = (container) => {
		let m = L.map(container, { preferCanvas: true }).setView(initialView, 15);
		L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
			attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>,
	        &copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`,
			subdomains: 'abcd',
			maxZoom: 14
		}).addTo(m);

		return m;
	};

	const mapAction = (container) => {
		const locaitonItems = items.filter((i) => i.coordinates && i.coordinates.length === 2);

		// no locations, no map
		if (locaitonItems.length === 0) {
			return {};
		}

		const map = createMap(container);

		const markerLayers = L.layerGroup();
		for (const item of locaitonItems) {
			markerLayers.addLayer(createMarker(item));
		}
		markerLayers.addTo(map);

		return {
			destroy: () => {
				map.remove();
			}
		};
	};
</script>

<div class="h-full w-full" use:mapAction />

<link
	rel="stylesheet"
	href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
	integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
	crossorigin=""
/>
