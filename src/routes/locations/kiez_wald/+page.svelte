<script lang="ts">
	import MapComponent from '$lib/components/MapComponent.svelte';
	import ImageFeed from '$lib/components/ImageFeed.svelte';
	import DevicesCard from '$lib/components/DevicesCard.svelte';
	import { Button } from 'flowbite-svelte';

	type LocationPageProps = {
		location: {
			name: string;
			description: string;
			image: string;
			coordinates: [number, number];
		};
		images: string[];
		devices: any[];
	};

	const { location, images, devices } = $props<LocationPageProps>();
</script>

<div class="space-y-12 p-6">
	<!-- Title and Description -->
	<section class="mx-auto max-w-4xl space-y-4">
		<h1 class="text-3xl font-bold">{location.name}</h1>
		<p class="text-lg text-gray-700">{location.description}</p>
	</section>

	<!-- Map and Toggle -->
	<section class="h-[400px] w-full">
		<MapComponent {location} />
	</section>

	<!-- Image Feed -->
	<section class="mx-auto max-w-5xl">
		<h2 class="mb-4 text-xl font-semibold">Recent Insect Activity</h2>
		<ImageFeed {images} />
	</section>

	<!-- Devices List -->
	<section class="mx-auto max-w-5xl">
		<h2 class="mb-4 text-xl font-semibold">Deployed Devices</h2>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
			{#each devices as device}
				<DevicesCard {device} activeDeviceId={-1} closeAllMenus={() => {}} />
			{/each}
		</div>
	</section>

	<!-- Transect Link -->
	<section class="text-center">
		<Button href="/transect/start?location={location.name}">Conduct a Transect</Button>
	</section>
</div>
