<script lang="ts">
	type Location = {
		name: string;
		image: string;
		link: string;
		description: string;
		deviceCount: number;
	};

	const { location } = $props<{ location: Location }>();
</script>

<a href={`/locations/${location.link}`} class="block no-underline">
	<div
		class="flex w-full max-w-xs flex-col items-center rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow duration-200 hover:border-blue-200 hover:shadow-lg"
	>
		<img src={location.image} alt={location.name} class="mb-4 h-32 w-full rounded object-cover" />
		<h2 class="mb-1 text-lg font-semibold text-gray-800">{location.name}</h2>
		<p class="mb-2 text-sm text-gray-600">{location.description}</p>
		<p class="font-mono text-sm text-gray-500">{location.deviceCount} device(s)</p>
	</div>
</a>
