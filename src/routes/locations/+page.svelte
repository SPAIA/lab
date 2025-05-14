<script lang="ts">
	import LocationsCard from '$lib/components/LocationCard.svelte';

	// Replace this with data from your backend
	const locations = [
		{
			name: 'Kiez Wald',
			image: 'https://kiezwald.de/wp-content/uploads/2021/09/cropped-Logo.png',
			link: 'kiez_wald',
			description: 'A tiny forrest in Moabit',
			deviceCount: 3
		},
		{
			name: 'Green Zero',
			image: 'https://greenzero.eu/_next/static/media/logo.e4716c8c.svg',
			description: 'coming soon ',
			deviceCount: 3
		}
	];
</script>

<div class="flex min-h-screen w-full">
	<div class="w-full overflow-scroll p-20">
		<h1 class="mb-6 text-2xl font-bold">Monitoring Locations</h1>
		<div class="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
			{#each locations as location}
				<LocationsCard {location} />
			{/each}
		</div>
	</div>
</div>
