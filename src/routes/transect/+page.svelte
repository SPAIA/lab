<script lang="ts">
	import { Button, Checkbox, Label, Radio, Input, Textarea } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	let currentSlide = 0;

	let form = {
		date: '',
		time: '',
		location: '',
		weather: '',
		temperature: '',
		wind: '',
		season: '',
		sightings: [{ group: '', count: '', behavior: '', where: '', notes: '' }],
		reflection: '',
		consent: false
	};

	$: totalSlides = 3 + form.sightings.length; // Introduction + Context + Sightings + Reflection

	function goNext() {
		if (currentSlide < totalSlides - 1) currentSlide++;
	}

	function goBack() {
		if (currentSlide > 0) currentSlide--;
	}

	function goToSlide(index: number) {
		currentSlide = index;
	}

	function addSightingAndAdvance() {
		form.sightings = [
			...form.sightings,
			{ group: '', count: '', behavior: '', where: '', notes: '' }
		];
		form = form; // Trigger reactivity
		// We need to wait for reactivity to update totalSlides before setting currentSlide
		setTimeout(() => {
			currentSlide = form.sightings.length + 1; // Adjust for intro and context slides
		}, 0);
	}

	function goToReflection() {
		currentSlide = totalSlides - 1; // Go to the last slide (reflection)
	}

	function submitForm() {
		console.log('Submitted:', form);
		alert('Thank you for your submission!');
		// Here you would typically send the data to your server
	}

	function startSurvey() {
		// Set current date and time
		const now = new Date();
		form.date = now.toISOString().split('T')[0]; // Format as YYYY-MM-DD
		form.time = now.toTimeString().slice(0, 5); // Format as HH:MM

		// Ask for location
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					form.location = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
					form = form; // Trigger reactivity
				},
				(error) => {
					console.error('Error getting location:', error);
					alert('Unable to get your location. Please enter it manually.');
				}
			);
		} else {
			alert('Geolocation is not supported by your browser. Please enter your location manually.');
		}

		// Move to the next slide
		goNext();
	}
</script>

<div class="relative mx-auto mt-12 w-full overflow-hidden">
	<!-- Slide Container -->
	<div
		class="flex transition-transform duration-300 ease-in-out"
		style={`width: ${totalSlides * 100}%; transform: translateX(-${(currentSlide / totalSlides) * 100}%);`}
	>
		<!-- Introduction Slide -->
		<div class="h-full flex-shrink-0 px-4" style={`width: ${100 / totalSlides}%`}>
			<div class="h-full space-y-6 rounded-3xl bg-white p-6 shadow">
				<h2 class="text-2xl font-bold">Urban Biodiversity Field Observation</h2>
				<h3 class="text-xl font-semibold">SPAIA x Moawald</h3>

				<div class="space-y-4">
					<p class="font-medium">How to conduct your transect survey:</p>
					<ol class="list-decimal space-y-2 pl-5">
						<li>Choose a straight path around 20–30 meters long</li>
						<li>Walk slowly along the line, observing about 1 meter to either side</li>
						<li>Look for insects — flying, crawling, feeding, resting</li>
						<li>
							For each sighting, record:
							<ul class="mt-2 list-disc space-y-1 pl-5">
								<li>
									Insect group (if known)—Bees, Butterflies & Moths, Flies, Beetles, Ants, Wasps,
									Other e.g. dragonflies, grasshoppers, unknowns)
								</li>
								<li>What it was doing (e.g. flying, feeding, mating)</li>
								<li>Where you saw it (e.g. on flower, in air, on bark)</li>
							</ul>
						</li>
						<li>
							If possible, take a photo of interesting sightings — this helps with identification
							later
						</li>
					</ol>

					<div class="mt-4 rounded-lg bg-blue-50 p-4">
						<p class="text-sm text-blue-800">
							A transect is a straight-line survey used by ecologists to record species along a
							defined path. As you walk, you observe and note all insects within a set distance,
							capturing data on presence, abundance, and behavior. It's a quick, structured way to
							understand what's happening in a habitat — and how it might be changing over time.
						</p>
					</div>
				</div>

				<div class="flex justify-center pt-6">
					<Button on:click={startSurvey} class="w-full md:w-auto">Start Survey</Button>
				</div>
			</div>
		</div>

		<!-- Context Slide -->
		<div class="h-full flex-shrink-0 px-4" style={`width: ${100 / totalSlides}%`}>
			<div class="h-full space-y-6 rounded-3xl bg-white p-6 shadow">
				<h2 class="text-2xl font-bold">Urban Biodiversity Field Observation</h2>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Input bind:value={form.date} type="date" placeholder="Date" />
					<Input bind:value={form.time} type="time" placeholder="Time" />
					<Input bind:value={form.location} placeholder="Location (GPS coordinates)" />
				</div>

				<div>
					<Label class="mb-2 block">Weather</Label>
					<div class="flex flex-wrap gap-4">
						{#each ['Sunny', 'Partly cloudy', 'Overcast', 'Rainy'] as condition}
							<div class="flex items-center gap-2">
								<Radio name="weather" value={condition} bind:group={form.weather} />
								<span>{condition}</span>
							</div>
						{/each}
					</div>

					<div class="mt-4 grid grid-cols-2 gap-4">
						<Input bind:value={form.temperature} type="number" placeholder="Temperature (°C)" />
						<div>
							<Label class="mb-2 block">Wind</Label>
							<div class="flex flex-wrap gap-4">
								{#each ['None', 'Light breeze', 'Moderate', 'Strong'] as wind}
									<div class="flex items-center gap-2">
										<Radio name="wind" value={wind} bind:group={form.wind} />
										<span>{wind}</span>
									</div>
								{/each}
							</div>
						</div>
						<Input bind:value={form.season} placeholder="Season" />
					</div>
				</div>

				<div class="flex justify-end">
					<Button
						on:click={() => {
							addSightingAndAdvance();
						}}
						class="mt-4">Add Sighting</Button
					>
				</div>
			</div>
		</div>

		<!-- Sighting Slides -->
		{#each form.sightings as sighting, i (i)}
			<div class="h-full flex-shrink-0 px-4" style={`width: ${100 / totalSlides}%`}>
				<div class="h-full space-y-6 rounded-3xl bg-white p-6 shadow">
					<h3 class="text-xl font-semibold">Sighting #{i + 1}</h3>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Input bind:value={sighting.group} placeholder="Insect Group (e.g. Bees, Flies)" />
						<Input bind:value={sighting.count} type="number" placeholder="Estimated Count" />
						<Input bind:value={sighting.behavior} placeholder="Behavior (e.g. flying, feeding)" />
						<Input bind:value={sighting.where} placeholder="Where Seen (e.g. flower, bark)" />
						<Textarea
							bind:value={sighting.notes}
							rows={2}
							placeholder="Notes"
							class="md:col-span-2"
						/>
					</div>

					<div class="flex justify-between pt-4">
						{#if i === form.sightings.length - 1}
							<Button on:click={addSightingAndAdvance} color="light" outline>
								Add Another Sighting
							</Button>
						{:else}
							<div></div>
							<!-- Spacer -->
						{/if}

						{#if i === form.sightings.length - 1}
							<div class="flex items-start gap-2">
								<Checkbox bind:checked={form.consent} />
								<Label class="ml-2">
									I consent to my observations being used anonymously for ecological monitoring and
									citizen science.
								</Label>
							</div>
						{/if}
					</div>

					{#if i === form.sightings.length - 1}
						<div class="flex justify-between">
							<Button on:click={goToReflection} color="blue">Done</Button>
							<Button on:click={addSightingAndAdvance} color="light" outline
								>Add Another Sighting</Button
							>
						</div>
					{/if}
				</div>
			</div>
		{/each}
		<!-- Reflection slide -->
		<div class="h-full flex-shrink-0 px-4" style={`width: ${100 / totalSlides}%`}>
			<div class="h-full space-y-6 rounded-3xl bg-white p-6 shadow">
				<h3 class="text-xl font-semibold">Final Reflection</h3>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Textarea
						bind:value={form.reflection}
						rows={2}
						placeholder="Notes"
						class="md:col-span-2"
					/>
				</div>

				<div class="flex justify-between pt-4">
					<Button onclick={submitForm} color="light" outline>Submit</Button>

					<div class="flex items-start gap-2">
						<Checkbox bind:checked={form.consent} />
						<Label class="ml-2">
							I consent to my observations being used anonymously for ecological monitoring and
							citizen science.
						</Label>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Navigation -->
	<div class="mt-6 flex items-center justify-between">
		<Button onclick={goBack} disabled={currentSlide === 0} color="light">Previous</Button>
		<div class="flex gap-2">
			{#each Array(totalSlides) as _, i}
				<button
					on:click={() => goToSlide(i)}
					class="h-2 w-2 rounded-full transition-colors"
					class:bg-blue-600={currentSlide === i}
					class:bg-gray-300={currentSlide !== i}
					aria-label={`Go to slide ${i + 1}`}
				></button>
			{/each}
		</div>
		<Button on:click={goNext} disabled={currentSlide >= totalSlides - 1} color="light">Next</Button>
	</div>

	<div class="mt-2 text-center text-sm text-gray-500">
		Slide {currentSlide + 1} of {totalSlides}
	</div>
</div>
