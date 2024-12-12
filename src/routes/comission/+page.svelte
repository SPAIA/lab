<script lang="ts">
	import { Card, Button, Label, Input, Select } from 'flowbite-svelte';
	import { ArrowDownOutline } from 'flowbite-svelte-icons';
	let formData = {
		wifi: {
			ssid: '',
			password: '',
			auth_mode: 3,
			scan_method: 0,
			sort_method: 1,
			retry_count: 10
		}
	};
	const scheduleOptions = [
		{ name: 'Once Daily', value: 'daily' },
		{ name: 'Once Hourly', value: 'hourly' },
		{ name: 'All the time', value: 'events' },
		{ name: 'Only on restart', value: 'boot' }
	];
	let selected;

	// Function to generate and download the JSON file
	const downloadJSON = () => {
		const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'config.json';
		a.click();
		URL.revokeObjectURL(url);
	};
</script>

<div class="flex w-full flex-col items-center justify-center">
	<Card>
		<h5 class="text-xl font-medium text-gray-900 dark:text-white">WiFi Configuration</h5>
		<form on:submit|preventDefault={downloadJSON}>
			<section>
				<div class="mb-6">
					<Label for="large-input" class="mb-2 block">WiFi SSID</Label>
					<Input
						id="ssid"
						type="text"
						bind:value={formData.wifi.ssid}
						class="input"
						placeholder="Enter your WiFi SSID"
					/>
				</div>
				<div class="mb-6">
					<Label for="large-input" class="mb-2 block">WiFi Password</Label>
					<Input
						id="password"
						type="password"
						bind:value={formData.wifi.password}
						placeholder="Enter your WiFi Password"
					/>
				</div>

				<div class="mb-6">
					<Label>
						Select an option
						<Select class="mt-2" items={scheduleOptions} bind:value={selected} />
					</Label>
				</div>
			</section>
			<Button type="submit" class="w-full ">
				Download config <ArrowDownOutline class="ms-2 h-6 w-6 text-white" />
			</Button>
		</form>
	</Card>
</div>
