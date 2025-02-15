<script lang="ts">
	import { goto } from '$app/navigation';
	import StepCard from '$lib/components/StepCard.svelte';
	import { setInfo } from '$lib/stores/infoStore';
	import { Button, Card, Spinner } from 'flowbite-svelte';
	export let nextPage: () => void;

	let isLoading = false;

	const delay = () => {
		isLoading = true;
		setTimeout(() => {
			nextPage();
			setInfo('Congratulations your device has been registered!');
			goto('/my/lab');
		}, 5000);
	};
</script>

<StepCard step={4}>
	<h2>Plug your device into your computer</h2>

	<Button on:click={delay} disabled={isLoading}>
		{#if isLoading}
			<Spinner class="mr-2" /> Flashing...
		{:else}
			Flash the firmware!
		{/if}
	</Button>
</StepCard>
