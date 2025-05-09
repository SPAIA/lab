<script lang="ts">
	import StepCard from '$lib/components/StepCard.svelte';
	import { encryptPassword } from '$lib/encrypt';
	import { Button, Input, Label } from 'flowbite-svelte';
	let password = '';

	async function downloadConfig() {
		console.log(password);
		const encrypted = await encryptPassword(password);
		alert(encrypted);
		// Create the configuration object
		// Convert to string (you might want to use a specific format like INI or JSON)
		// const configString = Object.entries(settings)
		// 	.map(([key, value]) => `${key}=${value}`)
		// 	.join('\n');
		// // Create blob and trigger download
		// const blob = new Blob([configString], { type: 'text/plain' });
		// const url = window.URL.createObjectURL(blob);
		// // Create a temporary link to trigger the download
		// const a = document.createElement('a');
		// a.href = url;
		// a.download = 'spaia.conf';
		// document.body.appendChild(a);
		// a.click();
		// // Clean up the URL and remove the temporary link
		// URL.revokeObjectURL(url);
		// a.remove();
		// configSaved = true;
	}
</script>

<StepCard step={3}>
	<Label for="ssid" class="mb-2 block">WiFi Network name (SSID)</Label>
	<!-- <Input
		id="ssid"
		size="lg"
		placeholder="Enter SSID"
		bind:value={settings.ssid}
		disabled={settings.uploadFrequency === 'never'}
	/> -->
	<div class="mb-6">
		<Label for="wifiPassword" class="mb-2 block">WiFi Password</Label>
		<Input
			id="wifiPassword"
			size="lg"
			type="password"
			placeholder="Enter WiFi Password"
			bind:value={password}
		/>
	</div>

	<Button on:click={downloadConfig}>Download Config</Button>
</StepCard>
