<script lang="ts">
	import { goto } from '$app/navigation';
	import StepCard from '$lib/components/StepCard.svelte';
	import { setInfo } from '$lib/stores/infoStore';
	import { Button, Card } from 'flowbite-svelte';
	export let nextPage: () => void;
	const delay = () => {
		setTimeout(() => {
			nextPage();
			setInfo('Congratulations your device has been registered!');
			goto('/my/lab');
		}, 5000);
	};
</script>

<StepCard step={4}>
	<h2>Plug you device in to your computer</h2>

	<Button on:click={delay}>Flash the firmware!</Button>
</StepCard>
