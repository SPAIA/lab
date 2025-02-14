<script lang="ts">
	import StepCard from '$lib/components/StepCard.svelte';
	import { Button, Card } from 'flowbite-svelte';
	export let nextPage: () => void;
</script>

<StepCard step={4}>
	<h2>Plug you device in to your computer</h2>

	<Button on:click={nextPage}>Flash the firmware!</Button>
</StepCard>
