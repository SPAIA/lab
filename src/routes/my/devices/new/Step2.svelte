<script lang="ts">
	import StepCard from '$lib/components/StepCard.svelte';
	import type { DeviceSettings } from '$lib/types';
	import { Button, Card, Label, Input, Select, Radio } from 'flowbite-svelte';
	export let nextPage: () => void;
	export let settings: DeviceSettings;
	let frequencyOptions = ['real-time', 'hourly', 'daily', 'never'];
</script>

<StepCard step={2}>
	<h2 class="mb-6 text-lg font-bold">Give your device a name</h2>

	<Input id="deviceName" size="lg" placeholder="Name" bind:value={settings.deviceName} />
	<p class="mb-4 text-xs italic">
		*Please choose a name as unique as you are. No spaces or special charachters.
	</p>
	<div class="mb-4"></div>
	<Button on:click={nextPage} disabled={!settings.deviceName}>Next</Button>
</StepCard>
