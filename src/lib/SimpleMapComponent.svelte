<script lang="ts">
	import { onMount } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import { browser } from '$app/environment';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
	import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

	const { location } = $props<{
		location: { latitude: number | null; longitude: number | null };
	}>();

	let mapContainer: HTMLDivElement;
	let map: mapboxgl.Map | null = null;
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let retryCount = $state(0);

	async function getLocationWithRetry() {
		try {
			// First try with fast timeout (3s)
			const position = await new Promise<GeolocationPosition>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					timeout: 3000,
					maximumAge: 0,
					enableHighAccuracy: true
				});
			});
			return position;
		} catch (firstError) {
			if (retryCount < 1) {
				// Try once more with longer timeout (10s)
				retryCount++;
				return await new Promise<GeolocationPosition>((resolve, reject) => {
					navigator.geolocation.getCurrentPosition(resolve, reject, {
						timeout: 10000,
						maximumAge: 0,
						enableHighAccuracy: false
					});
				});
			}
			throw new Error('Location request timed out');
		}
	}

	async function initializeMap(longitude: number, latitude: number) {
		mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

		map = new mapboxgl.Map({
			container: mapContainer,
			style: 'mapbox://styles/mapbox/streets-v12',
			center: [longitude, latitude],
			zoom: 16
		});

		map.addControl(new mapboxgl.NavigationControl());

		// Marker
		const marker = new mapboxgl.Marker({ color: '#3CF4A2' })
			.setLngLat([longitude, latitude])
			.addTo(map);

		// Geocoder
		const geocoder = new MapboxGeocoder({
			accessToken: mapboxgl.accessToken,
			mapboxgl: mapboxgl,
			marker: false,
			placeholder: 'Search for a location'
		});

		geocoder.addTo('#geocoder');
		console.log('go');
		// When a result is selected
		geocoder.on('result', (e: any) => {
			if (!map) return;
			const coords = e.result.center;
			marker.setLngLat(coords);
			map.flyTo({ center: coords });
			location.latitude = coords[1];
			location.longitude = coords[0];
		});
	}

	onMount(async () => {
		if (!browser) return;

		try {
			const position = await getLocationWithRetry();
			const { longitude, latitude } = position.coords;
			await initializeMap(longitude, latitude);
			isLoading = false;
		} catch (err) {
			console.error('Location error:', err);
			error = 'Could not get your location. Please check browser permissions or enter manually.';
			isLoading = false;

			// Fallback to Berlin coordinates
			if (!map) {
				await initializeMap(13.405, 52.52);
			}
		}
	});
</script>

<div class="relative h-[400px] w-full">
	{#if isLoading}
		<div class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-100/50">
			<p>Getting your location...</p>
			{#if retryCount > 0}
				<p class="text-sm text-gray-600">Taking longer than expected, retrying...</p>
			{/if}
		</div>
	{:else if error}
		<div class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-100/50">
			<p class="text-red-600">{error}</p>
			<p class="text-sm">Showing default location</p>
		</div>
	{/if}
	<div class="absolute left-2 top-2 mb-2">
		<div id="geocoder" class="flex w-full gap-2"></div>
	</div>
	<div bind:this={mapContainer} class="h-full w-full rounded-lg border border-gray-200"></div>
	<div class="mapboxgl-ctrl-geocoder"></div>
</div>

<style global>
	.mapboxgl-ctrl-geocoder {
		padding-left: 20px !important;
	}
</style>
