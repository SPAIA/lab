<script lang="ts">
	import StepCard from '$lib/components/StepCard.svelte';
	import type { DeviceSettings } from '$lib/types';
	import { Button, Card, Label, Input, Select, Radio } from 'flowbite-svelte';
	export let nextPage: () => void;
	export let settings: DeviceSettings;
	let frequencyOptions = ['real-time', 'hourly', 'daily', 'never'];
</script>

<StepCard step={2}>
	<h2 class="mb-6 text-lg font-bold">
		How often should the device try and upload data to the database?
	</h2>
	<p class="mb-4 text-xs italic">
		*The longer the period between uploads, the less battery power is used.
	</p>
	<div class="mb-4">
		{#each frequencyOptions as option}
			<Radio name="uploadFrequency" bind:group={settings.uploadFrequency} value={option}
				>{option}</Radio
			>
		{/each}
	</div>
	<Button on:click={nextPage} disabled={!settings.uploadFrequency}>Next</Button>
</StepCard>
