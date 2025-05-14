<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import type { Map } from 'mapbox-gl';
	import MapboxDraw from '@mapbox/mapbox-gl-draw';
	import { getLocation, location } from './stores/geolocationStore';
	import * as turf from '@turf/turf';
	import type { Feature, FeatureCollection, GeoJsonProperties, Polygon } from 'geojson';
	import { activeHabitat } from './stores/habitatStore';
	import { fetchWithToken } from './api';
	import type { Habitat } from './types/habitatTypes';
	import { goto } from '$app/navigation';
	import { editMap } from './stores/mapStore';
	import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
	import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
	import { browser } from '$app/environment';

	let mapContainer: HTMLDivElement;
	const longitude: number = 13.405;
	const latitude: number = 52.52;
	let isSatelliteView = false;
	export let initialZoom = 8;
	export let flytoZoom = 12;
	export let showDraw = true;
	export let showtoggle = false;

	const ZOOM_THRESHOLD = 13;

	function calculateArea(data: Feature<Polygon> | FeatureCollection<Polygon>): number {
		try {
			if ('type' in data && data.type === 'Feature') {
				return Math.round(turf.area(data));
			} else if ('features' in data && data.features.length > 0) {
				return Math.round(turf.area(data.features[0]));
			}
			return 0;
		} catch (error) {
			console.error('Error calculating area:', error);
			return 0;
		}
	}

	function flyToUser(map: Map) {
		location.subscribe((position) => {
			if (position.latitude && position.longitude) {
				const targetCoordinates = {
					center: [position.longitude, position.latitude] as [number, number],
					zoom: flytoZoom,
					essential: true
				};
				map.flyTo(targetCoordinates);
			}
		});
	}

	function calculatePolygonCenter(polygonFeature: any): [number, number] {
		try {
			if (typeof polygonFeature === 'string') {
				polygonFeature = JSON.parse(polygonFeature);
			}

			if (!polygonFeature || !polygonFeature.geometry) {
				console.error('Invalid polygon feature:', polygonFeature);
				return [longitude, latitude];
			}

			// Create a valid GeoJSON feature
			const feature = turf.feature(polygonFeature.geometry);
			const center = turf.centerOfMass(feature);
			return center.geometry.coordinates as [number, number];
		} catch (error) {
			console.error('Error calculating polygon center:', error);
			return [longitude, latitude];
		}
	}

	let draw: MapboxDraw;
	onMount(() => {
		mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
		getLocation();

		const map = new mapboxgl.Map({
			container: mapContainer,
			style: 'mapbox://styles/notsosapien/cltw1zawc00bb01qw4mz940rc',
			center: [longitude, latitude],
			zoom: initialZoom
		});

		document.getElementById('toggleView')?.addEventListener('click', () => {
			isSatelliteView = !isSatelliteView;
			map.setStyle(
				isSatelliteView
					? 'mapbox://styles/mapbox/satellite-v9'
					: 'mapbox://styles/notsosapien/cltw1zawc00bb01qw4mz940rc'
			);
		});

		draw = new MapboxDraw({
			displayControlsDefault: false,
			controls: {
				polygon: true,
				trash: true
			}
		});

		map.addControl(
			new MapboxGeocoder({
				accessToken: mapboxgl.accessToken,
				mapboxgl: mapboxgl
			})
		);
		map.addControl(new mapboxgl.NavigationControl());
		editMap.subscribe((mode) => {
			mode && showDraw ? map.addControl(draw) : (draw ?? map.removeControl(draw));
		});

		map.on('draw.create', updateArea);
		map.on('draw.delete', updateArea);
		map.on('draw.update', updateArea);

		async function parseFeatures(): Promise<Habitat[]> {
			if (!browser) return Promise.resolve([]);
			let apiResponse = (await fetchWithToken('/api/habitats')) as Habitat[];
			return apiResponse;
		}

		const markers: { [key: string]: mapboxgl.Marker } = {};
		const popups: { [key: string]: mapboxgl.Popup } = {};

		function updateLayerVisibility(zoom: number) {
			features.forEach((habitat, index) => {
				const layerId = `polygon-${index}`;
				const markerId = `marker-${index}`;

				if (zoom >= ZOOM_THRESHOLD) {
					map.setLayoutProperty(layerId, 'visibility', 'visible');
					markers[markerId]?.remove();
				} else {
					map.setLayoutProperty(layerId, 'visibility', 'none');
					if (!markers[markerId] && habitat.feature) {
						try {
							const center = calculatePolygonCenter(habitat.feature);

							const el = document.createElement('div');
							el.className = 'habitat-marker';
							el.style.backgroundColor = '#3cf4a2';
							el.style.width = '15px';
							el.style.height = '15px';
							el.style.borderRadius = '50%';
							el.style.border = '2px solid white';

							const marker = new mapboxgl.Marker(el)
								.setLngLat(center)
								.setPopup(
									new mapboxgl.Popup({ offset: 25 }).setHTML(
										`<h3 class="text-lg text-bold">${habitat.name}</h3><p>AREA: ${habitat.area}m<sup>2</sup></p>`
									)
								)
								.addTo(map);

							marker.getElement().addEventListener('click', () => {
								goto('/habitat/' + habitat.habitatId);
							});

							markers[markerId] = marker;
						} catch (error) {
							console.error('Error creating marker for habitat:', habitat.habitatId, error);
						}
					} else if (markers[markerId]) {
						markers[markerId].addTo(map);
					}
				}
			});
		}

		let features: Habitat[] = [];
		map.on('load', async () => {
			features = await parseFeatures();
			features.forEach((habitat, index) => {
				if (!habitat.feature) return;

				const polygon = JSON.parse(habitat.feature as string);
				const layerId = `polygon-${index}`;

				map.addSource(layerId, {
					type: 'geojson',
					data: polygon
				});

				map.addLayer({
					id: layerId,
					type: 'fill',
					source: layerId,
					layout: {},
					paint: {
						'fill-color': '#3cf4a2',
						'fill-opacity': 1
					}
				});

				let currentPopup = new mapboxgl.Popup({
					closeButton: false,
					closeOnClick: false
				});

				map.on('mouseenter', layerId, (e) => {
					const coordinates = e.lngLat;
					const description = `<h3 class="text-lg text-bold">${habitat.name}</h3><p>AREA: ${habitat.area}m<sup>2</sup></p>`;
					currentPopup.setLngLat(coordinates).setHTML(description).addTo(map);
					map.getCanvas().style.cursor = 'pointer';
				});

				map.on('mouseleave', layerId, () => {
					currentPopup.remove();
					map.getCanvas().style.cursor = '';
				});

				map.on('click', layerId, () => {
					goto('/habitat/' + habitat.habitatId);
				});
			});

			updateLayerVisibility(map.getZoom());

			map.on('zoom', () => {
				updateLayerVisibility(map.getZoom());
			});

			const unsubscribe = activeHabitat.subscribe(($activeHabitat) => {
				if ($activeHabitat && $activeHabitat.feature) {
					const feature =
						typeof $activeHabitat.feature === 'string'
							? JSON.parse($activeHabitat.feature)
							: $activeHabitat.feature;

					// Create a FeatureCollection if we received a Feature
					const featureCollection =
						feature.type === 'Feature'
							? { type: 'FeatureCollection', features: [feature] }
							: feature;

					draw.add(featureCollection);
					const bounds = turf.bbox(featureCollection);
					map.fitBounds(bounds as [number, number, number, number], {
						padding: 200
					});
				} else {
					flyToUser(map);
				}
			});

			return () => {
				unsubscribe();
				Object.values(markers).forEach((marker) => marker.remove());
			};
		});

		async function updateArea() {
			const data = draw.getAll();
			if (data.features.length > 0) {
				if (data && data.features[0].geometry.type === 'Polygon' && $activeHabitat) {
					const area = calculateArea(data.features[0] as Feature<Polygon>);
					activeHabitat.update((habitat) => ({
						...habitat,
						feature: data.features[0] || null,
						area: area
					}));
				}
			} else {
				activeHabitat.update(($activeHabitat) => {
					if ($activeHabitat) {
						return { ...$activeHabitat, area: 0, polygon: null };
					}
					return $activeHabitat;
				});
			}
		}
	});
</script>

<div bind:this={mapContainer} class="relative h-full w-full"></div>
{#if showtoggle}
	<button
		class="left-50 absolute bottom-14 m-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
		id="toggleView">Toggle View</button
	>
{/if}

<style>
	.habitat-marker {
		cursor: pointer;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
	}
</style>
