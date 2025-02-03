<script lang="ts">
	import { Card } from 'flowbite-svelte';
	export let step = 1;
</script>

<Card class="relative h-full w-full">
	<div class="relative h-8">
		<div
			class="absolute -top-12 left-1/2 flex h-16 w-16 -translate-x-1/2 flex-col items-center justify-center rounded-full bg-white align-middle text-4xl font-extrabold drop-shadow-md"
		>
			{step}
		</div>
	</div>
	<div class="flex h-full flex-col justify-between">
		<slot />
	</div>
</Card>
