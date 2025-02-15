<script lang="ts">
	import { applyAction } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import StepCard from '$lib/components/StepCard.svelte';
	import type { DeviceSettings } from '$lib/types';
	import { Button, Card, Label, Input, Select, Radio } from 'flowbite-svelte';
	export let nextPage: () => void;
	export let settings: DeviceSettings;
	let frequencyOptions = ['real-time', 'hourly', 'daily', 'never'];
	const createDedvice = async (event: MouseEvent) => {
		event.preventDefault();

		const formData = new FormData();
		formData.append('deviceName', settings.deviceName || 'foo');

		// Call the action
		const response = await fetch('?/create', {
			method: 'POST',
			body: formData
		});

		const result = await response.json();
		console.log(result);
		const newDevice = JSON.parse(result.data);
		console.log(newDevice);
		applyAction(result);

		if (newDevice) {
			nextPage();
			// Optional: refresh data if needed
		}
	};
</script>

<StepCard step={2}>
	<h2 class="mb-6 text-lg font-bold">Give your device a name</h2>

	<Input id="deviceName" size="lg" placeholder="Name" bind:value={settings.deviceName} />
	<p class="mb-4 text-xs italic">
		*Please choose a name as unique as you are. No spaces or special charachters.
	</p>
	<div class="mb-4"></div>
	<Button on:click={createDedvice} disabled={!settings.deviceName}>Next</Button>
</StepCard>
