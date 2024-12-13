<script lang="ts">
	import { onMount } from 'svelte';

	interface Insect {
		id: string;
		x: number;
		y: number;
		speed: number;
		direction: number;
	}

	let insects: Insect[] = [];
	let insectsPerHour = 10; // Frequency of insect appearances (insects/hour)
	let minSpeed = 0.5; // Min speed of insects
	let maxSpeed = 2.5; // Max speed of insects

	const hourInMilliseconds = 3600 * 1000; // 1 hour in milliseconds
	const spawnInterval = () => hourInMilliseconds / insectsPerHour; // Time between spawns in ms
	let numInsects = 0; // Active insects count

	let animationFrame: number;
	let spawnTimeout: NodeJS.Timeout;

	// Function to create a new insect with random properties
	function createInsect(): Insect {
		return {
			id: Math.random().toString(36).substring(7),
			x: Math.random() * 100, // Random initial x position (percentage)
			y: Math.random() * 100, // Random initial y position (percentage)
			speed: Math.random() * (maxSpeed - minSpeed) + minSpeed, // Random speed within range
			direction: Math.random() * 360 // Random direction in degrees
		};
	}

	// Spawn new insects based on the frequency
	function spawnInsects() {
		insects.push(createInsect());
		numInsects++;
		scheduleNextSpawn();
	}

	// Schedule the next insect spawn based on the slider
	function scheduleNextSpawn() {
		if (spawnTimeout) clearTimeout(spawnTimeout);
		if (insectsPerHour > 0) {
			spawnTimeout = setTimeout(spawnInsects, spawnInterval());
		}
	}

	// Function to move insects across the screen
	function moveInsects(): void {
		insects = insects.map((insect) => {
			const angle = (insect.direction * Math.PI) / 180;
			insect.x += Math.cos(angle) * insect.speed;
			insect.y += Math.sin(angle) * insect.speed;

			// Wrap around the screen edges
			if (insect.x < 0) insect.x = 100;
			if (insect.x > 100) insect.x = 0;
			if (insect.y < 0) insect.y = 100;
			if (insect.y > 100) insect.y = 0;

			// Randomly change direction and speed occasionally
			if (Math.random() < 0.02) {
				insect.direction = Math.random() * 360;
				insect.speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
			}

			return insect;
		});
	}

	// Animation update loop
	const update = () => {
		moveInsects();
		animationFrame = requestAnimationFrame(update);
	};

	onMount(() => {
		scheduleNextSpawn(); // Start spawning insects
		animationFrame = requestAnimationFrame(update);

		return () => {
			if (spawnTimeout) clearTimeout(spawnTimeout);
			cancelAnimationFrame(animationFrame);
		};
	});

	// Recreate insects when speed range or frequency changes
	function updateSettings(): void {
		insects = []; // Clear all current insects
		numInsects = 0;
		scheduleNextSpawn(); // Restart the spawn loop
	}
</script>

<div class="relative h-screen w-full overflow-hidden bg-gray-100">
	<div class="absolute left-4 top-4 z-10">
		<div class="mb-4 text-xl">Insect Simulation</div>

		<!-- Insects per hour -->
		<div class="mb-4">
			<label for="insectsPerHour" class="block text-sm">Insects per Hour: {insectsPerHour}</label>
			<input
				id="insectsPerHour"
				type="range"
				min="0"
				max="6000"
				step="1"
				bind:value={insectsPerHour}
				on:input={updateSettings}
				class="w-full"
			/>
		</div>

		<!-- Speed Range -->
		<div class="mb-4">
			<label for="minSpeed" class="block text-sm">Min Speed: {minSpeed.toFixed(2)}</label>
			<input
				id="minSpeed"
				type="range"
				min="0.1"
				max="2.0"
				step="0.1"
				bind:value={minSpeed}
				on:input={updateSettings}
				class="w-full"
			/>
		</div>

		<div class="mb-4">
			<label for="maxSpeed" class="block text-sm">Max Speed: {maxSpeed.toFixed(2)}</label>
			<input
				id="maxSpeed"
				type="range"
				min="0.1"
				max="5.0"
				step="0.1"
				bind:value={maxSpeed}
				on:input={updateSettings}
				class="w-full"
			/>
		</div>

		<div>Active Insects: {numInsects}</div>
	</div>

	{#each insects as insect (insect.id)}
		<div
			class="absolute rounded-full bg-black"
			style="width: 8px; height: 8px; transform: translate({insect.x}vw, {insect.y}vh);"
		></div>
	{/each}
</div>
