<script lang="ts">
	import DevicesCard from '$lib/components/DevicesCard.svelte';
	import { Button } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import { type ApiResponse, type Device, type SPAIAEvent } from '$lib/types';
	import DevicesCardMini from '$lib/components/DevicesCardMini.svelte';
	import { page } from '$app/stores';

	// Use Svelte 5 runes for props
	let { data } = $props<{
		data: {
			devices: any[];
			pagination?: { totalCount: number };
		};
	}>();

	let lastPage = 0;

	let events = $state<Array<SPAIAEvent>>([]);

	const location = {
		name: 'Kiez Wald',
		description: `The Moawald was planted in 2024 by the Kiezwald e.V. together with local residents. <br/>
		As part of climate adaptation efforts, it’s now part of the ZK/U Climate Trail and invites the public to explore urban nature through collaborative experiments.`,

		image:
			'https://kiezwald.de/wp-content/uploads/2024/10/Einladung_Ein_Tiny_Forest_im_Moabiter_Stadtgarten-1443x2048.png',
		coordinates: [13.336587148733804, 52.53415044826952]
	};

	let devices: Device[] = $derived(data.devices);
	let mapContainer: HTMLDivElement;
	let map: mapboxgl.Map;
	let marker: mapboxgl.Marker;

	async function fetchEvents(): Promise<SPAIAEvent[]> {
		try {
			const response = await fetch(`https://beta.api.spaia.earth/events/user/kiez-wald`);
			if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
			const result: ApiResponse<SPAIAEvent[]> = await response.json();
			lastPage = result.pagination?.totalPages || 1;
			return result.data || [];
		} catch (error) {
			console.error(`Error fetching events: ${(error as Error).message}`);
			return [];
		}
	}

	onMount(() => {
		mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
		map = new mapboxgl.Map({
			container: mapContainer,
			style: 'mapbox://styles/notsosapien/cltw1zawc00bb01qw4mz940rc',
			center: [location.coordinates[0], location.coordinates[1]],
			zoom: 16
		});

		marker = new mapboxgl.Marker({ draggable: true })
			.setLngLat([location.coordinates[0], location.coordinates[1]])
			.addTo(map);

		marker.on('dragend', () => {
			const lngLat = marker.getLngLat();
			console.log('Updated coordinates:', lngLat);
		});
		fetchEvents().then((ev) => {
			events = ev;
		});
	});
</script>

<svelte:head>
	<link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
</svelte:head>

<div class="relative flex h-full w-full flex-col">
	<!-- Background Map -->
	<div bind:this={mapContainer} class="fixed inset-0 z-0 h-screen w-full opacity-30"></div>

	<!-- Main Content Area -->
	<main class="relative z-10 flex-1 overflow-y-auto pb-28">
		<!-- pb-28 for film strip space -->
		<div class="container mx-auto px-6 pt-4">
			<!-- Title and Description -->
			<section class="mb-8 max-w-4xl space-y-4 rounded-lg bg-white p-6 shadow-sm">
				<h1 class="text-3xl font-bold">{location.name}</h1>
				<p class="text-lg text-gray-700">{@html location.description}</p>
			</section>

			<!-- Devices List -->
			<section class="mx-auto mb-8 max-w-5xl rounded-lg bg-white p-6 shadow-sm backdrop-blur-sm">
				<h2 class="mb-4 text-xl font-semibold">{devices.length} Deployed Devices</h2>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
					{#each devices as device}
						<DevicesCardMini {device} activeDeviceId={-1} />
					{/each}
				</div>
			</section>

			<!-- Transect Link -->
			<section class="mb-8 text-center">
				<Button href="/transect/start?location={location.name}">Conduct a Transect</Button>
			</section>
		</div>
	</main>

	<!-- Horizontal Film Strip (Fixed at bottom) -->
	<div
		class="fixed bottom-0 left-0 right-0 z-20 h-24 overflow-x-auto border-t border-gray-200 bg-white/90 backdrop-blur-sm"
	>
		<div class="flex h-full items-center space-x-4 px-4">
			{#each events as event, i}
				<div
					class="group h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded shadow-sm transition-all hover:shadow-md"
				>
					<img
						src={`https://beta.api.spaia.earth/images/${event.media[0]?.fileId}`}
						alt={`Gallery image ${i + 1}`}
						class="h-full w-full object-cover transition-transform group-hover:scale-105"
					/>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	/* Custom scrollbar for the film strip */
	::-webkit-scrollbar {
		height: 6px;
	}
	::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.1);
	}
	::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 3px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 0, 0, 0.3);
	}
</style>
