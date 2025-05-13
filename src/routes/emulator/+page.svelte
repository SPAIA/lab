<script lang="ts">
	type Box = { x: number; y: number; w: number; h: number };
	type Track = {
		id: number;
		path: { x: number; y: number }[];
		lastSeen: number;
		box: Box;
		velocity: { x: number; y: number };
		kalmanCovX?: number;
		kalmanCovY?: number;
	};
	type SmoothedBox = Box;

	import { onMount } from 'svelte';

	// Enhanced trail settings
	let trailLength = $state(50); // Base trail length
	let velocityMultiplier = $state(2); // How much velocity extends trails
	let minTrailLength = $state(10); // Minimum trail points
	let dynamicTrails = $state(true); // Enable velocity-based trail length

	let video: HTMLVideoElement;
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let previousFrame: ImageData | null = null;

	let tracks: Track[] = [];
	let trackId = 0;
	let frameCount = 0;

	const width = 320;
	const height = 240;
	const KALMAN_R = 0.01;
	const KALMAN_Q = 0.1;

	let boundingBoxes: Box[] = [];
	let devices: MediaDeviceInfo[] = [];
	let selectedDeviceId: string | null = null;

	let threshold = $state(34);
	let minBoxSize = $state(20);
	let minMotionPixels = $state(50);
	let maxTrackAge = $state(50);
	let iouThreshold = $state(0.1);
	let useKalman = $state(true);

	let isContinuityCameraAvailable = $state(false);

	let permissionGranted = $state(false);
	let isLoading = $state(false);
	let errorMessage = $state('');

	let lastFrameTime = 0;
	let frameRate = 0;
	let averageFrameTime = 16.67; // Start assuming 60fps
	let lastDrawTime = 0;
	const drawInterval = 1000 / 30; // Target 30fps for drawing

	const proximityThreshold = $state(40);

	function smoothBox(prev: SmoothedBox, next: SmoothedBox, alpha = 0.4): SmoothedBox {
		return {
			x: prev.x * (1 - alpha) + next.x * alpha,
			y: prev.y * (1 - alpha) + next.y * alpha,
			w: prev.w * (1 - alpha) + next.w * alpha,
			h: prev.h * (1 - alpha) + next.h * alpha
		};
	}

	function centerDist(a: Box, b: Box): number {
		return Math.hypot(a.x + a.w / 2 - b.x - b.w / 2, a.y + a.h / 2 - b.y - b.h / 2);
	}

	function kalmanPredict(position: number, velocity: number, covariance: number): [number, number] {
		const predictedPos = position + velocity;
		const predictedCov = covariance + KALMAN_Q;
		return [predictedPos, predictedCov];
	}

	function kalmanUpdate(
		predictedPos: number,
		predictedCov: number,
		measurement: number
	): [number, number] {
		const kalmanGain = predictedCov / (predictedCov + KALMAN_R);
		const newPos = predictedPos + kalmanGain * (measurement - predictedPos);
		const newCov = (1 - kalmanGain) * predictedCov;
		return [newPos, newCov];
	}

	async function getVideoDevices() {
		isLoading = true;
		errorMessage = '';

		try {
			// First get permission with a generic request
			const stream = await navigator.mediaDevices.getUserMedia({ video: true });

			// Stop all tracks immediately after getting permission
			stream.getTracks().forEach((track) => track.stop());

			// Now enumerate devices
			const allDevices = await navigator.mediaDevices.enumerateDevices();
			devices = allDevices.filter((d) => d.kind === 'videoinput');

			permissionGranted = true;

			// Set default selection if none exists
			if (devices.length > 0 && !selectedDeviceId) {
				selectedDeviceId = devices[0].deviceId;
			}
		} catch (err) {
			errorMessage = 'Could not access camera devices. Please ensure permissions are granted.';
			console.error('Error getting camera devices:', err);
		} finally {
			isLoading = false;
		}
	}

	async function initCamera() {
		if (!canvas || !video) return;
		ctx = canvas.getContext('2d')!;
		if (!ctx) return;

		try {
			const constraints = {
				video: {
					deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
					width: { ideal: width },
					height: { ideal: height }
				}
			};

			const stream = await navigator.mediaDevices.getUserMedia(constraints);
			video.srcObject = stream;
			video.onloadedmetadata = () => {
				video.play();
				requestAnimationFrame(processFrame);
			};
		} catch (error) {
			console.error('Error initializing camera:', error);
			// Fallback to default camera if Continuity Camera fails
			if (selectedDeviceId && isContinuityCameraAvailable) {
				selectedDeviceId = null;
				initCamera(); // Retry with default camera
			}
		}
	}

	onMount(() => {
		getVideoDevices();
	});

	function iou(a: Box, b: Box): number {
		const x1 = Math.max(a.x, b.x);
		const y1 = Math.max(a.y, b.y);
		const x2 = Math.min(a.x + a.w, b.x + b.w);
		const y2 = Math.min(a.y + a.h, b.y + b.h);
		const interArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
		return interArea / (a.w * a.h + b.w * b.h - interArea);
	}

	function mergeBoxesByIOU(boxes: Box[], iouThreshold = 0.3, proximityThreshold = 40): Box[] {
		const merged: Box[] = [];

		while (boxes.length > 0) {
			const base = boxes.shift()!;
			const overlapping = [base];

			for (let i = boxes.length - 1; i >= 0; i--) {
				const other = boxes[i];
				const overlap = iou(base, other);
				const dist = centerDist(base, other);
				if (overlap > iouThreshold || dist < proximityThreshold) {
					overlapping.push(other);
					boxes.splice(i, 1);
				}
			}

			const avg = overlapping.reduce(
				(acc, b) => ({
					x: acc.x + b.x,
					y: acc.y + b.y,
					w: acc.w + b.w,
					h: acc.h + b.h
				}),
				{ x: 0, y: 0, w: 0, h: 0 }
			);

			const count = overlapping.length;
			merged.push({
				x: avg.x / count,
				y: avg.y / count,
				w: avg.w / count,
				h: avg.h / count
			});
		}

		return merged;
	}

	function processFrame(timestamp: number) {
		if (!ctx || !video) return;

		// Frame rate calculation
		if (lastFrameTime > 0) {
			const frameTime = timestamp - lastFrameTime;
			averageFrameTime = averageFrameTime * 0.9 + frameTime * 0.1;
			frameRate = 1000 / averageFrameTime;
		}
		lastFrameTime = timestamp;

		// Calculate normalized frame time (1.0 = 60fps)
		const frameTimeNormalized = Math.min(2, Math.max(0.5, averageFrameTime / 16.67));

		ctx.drawImage(video, 0, 0, width, height);
		const currentFrame = ctx.getImageData(0, 0, width, height);

		if (previousFrame) {
			const motionMask = new Uint8ClampedArray(width * height);
			const adjustedThreshold = threshold * frameTimeNormalized;

			for (let i = 0; i < currentFrame.data.length; i += 4) {
				const g1 = (currentFrame.data[i] + currentFrame.data[i + 1] + currentFrame.data[i + 2]) / 3;
				const g0 =
					(previousFrame.data[i] + previousFrame.data[i + 1] + previousFrame.data[i + 2]) / 3;
				motionMask[i / 4] = Math.abs(g1 - g0) > adjustedThreshold ? 255 : 0;
			}

			const rawBoxes = extractBoundingBoxes(motionMask, width, height);
			boundingBoxes = mergeBoxesByIOU(rawBoxes, iouThreshold, proximityThreshold);

			frameCount++;
			const updatedTracks: Track[] = [];

			for (const box of boundingBoxes) {
				let bestMatch: Track | null = null;
				let bestScore = 0;

				for (const track of tracks) {
					// Combined score using IOU and velocity
					const iouScore = iou(track.box, box);
					const dist = centerDist(track.box, box);
					const velocityScore = 1 - Math.min(1, dist / (100 * frameTimeNormalized));
					const score = iouScore * 0.6 + velocityScore * 0.4;

					if (score > bestScore && score > 0.15) {
						bestScore = score;
						bestMatch = track;
					}
				}

				const center = { x: box.x + box.w / 2, y: box.y + box.h / 2 };

				if (bestMatch) {
					// Calculate velocity (pixels per normalized frame)
					const lastCenter = bestMatch.path[bestMatch.path.length - 1] || center;
					const velocity = {
						x: (center.x - lastCenter.x) / frameTimeNormalized,
						y: (center.y - lastCenter.y) / frameTimeNormalized
					};

					// Update track with velocity
					bestMatch.velocity = velocity;
					bestMatch.path.push(center);

					// Dynamic trail length based on velocity
					if (dynamicTrails) {
						const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
						const dynamicLength = Math.min(
							trailLength * (1 + (speed * velocityMultiplier) / 10),
							trailLength * 3
						);
						const desiredLength = Math.max(minTrailLength, dynamicLength);

						if (bestMatch.path.length > desiredLength) {
							bestMatch.path = bestMatch.path.slice(-Math.floor(desiredLength));
						}
					} else if (bestMatch.path.length > trailLength) {
						bestMatch.path = bestMatch.path.slice(-trailLength);
					}

					// Kalman filter update
					let newBox = box;
					if (useKalman) {
						const [predictedX, covX] = kalmanPredict(
							bestMatch.box.x,
							bestMatch.velocity.x * frameTimeNormalized,
							bestMatch.kalmanCovX || 0.1
						);
						const [predictedY, covY] = kalmanPredict(
							bestMatch.box.y,
							bestMatch.velocity.y * frameTimeNormalized,
							bestMatch.kalmanCovY || 0.1
						);
						const [newX, newCovX] = kalmanUpdate(predictedX, covX, box.x);
						const [newY, newCovY] = kalmanUpdate(predictedY, covY, box.y);
						bestMatch.kalmanCovX = newCovX;
						bestMatch.kalmanCovY = newCovY;
						newBox = { ...box, x: newX, y: newY };
					}

					bestMatch.lastSeen = frameCount;
					const alpha = Math.min(0.8, 0.3 + centerDist(bestMatch.box, box) / 50);
					bestMatch.box = smoothBox(bestMatch.box, newBox, alpha);
					updatedTracks.push(bestMatch);
				} else {
					// New track with zero initial velocity
					updatedTracks.push({
						id: trackId++,
						path: [center],
						lastSeen: frameCount,
						box: smoothBox(box, box, 0),
						velocity: { x: 0, y: 0 },
						kalmanCovX: 0.1,
						kalmanCovY: 0.1
					});
				}
			}

			// Persist old tracks that haven't been updated
			for (const track of tracks) {
				if (!updatedTracks.includes(track)) {
					if (frameCount - track.lastSeen <= maxTrackAge) {
						// Predict position for missing frames
						if (useKalman && track.velocity) {
							track.box.x += track.velocity.x * frameTimeNormalized;
							track.box.y += track.velocity.y * frameTimeNormalized;
						}
						updatedTracks.push(track);
					}
				}
			}

			tracks = updatedTracks;

			// Throttle drawing to maintain performance
			if (!lastDrawTime || timestamp - lastDrawTime > drawInterval) {
				drawBoxes();
				lastDrawTime = timestamp;
			}
		}

		previousFrame = currentFrame;
		requestAnimationFrame(processFrame);
	}
	function extractBoundingBoxes(mask: Uint8ClampedArray, w: number, h: number): Box[] {
		const boxes: Box[] = [];
		const visited = new Uint8Array(w * h);
		const getIdx = (x: number, y: number) => y * w + x;

		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const idx = getIdx(x, y);
				if (mask[idx] === 255 && !visited[idx]) {
					let minX = x,
						maxX = x,
						minY = y,
						maxY = y;
					let pixelCount = 0;
					const queue = [{ x, y }];
					visited[idx] = 1;

					while (queue.length) {
						const { x: qx, y: qy } = queue.pop()!;
						pixelCount++;
						for (let dy = -1; dy <= 1; dy++) {
							for (let dx = -1; dx <= 1; dx++) {
								const nx = qx + dx,
									ny = qy + dy;
								if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
									const nidx = getIdx(nx, ny);
									if (mask[nidx] === 255 && !visited[nidx]) {
										visited[nidx] = 1;
										queue.push({ x: nx, y: ny });
										minX = Math.min(minX, nx);
										maxX = Math.max(maxX, nx);
										minY = Math.min(minY, ny);
										maxY = Math.max(maxY, ny);
									}
								}
							}
						}
					}

					const boxW = maxX - minX + 1;
					const boxH = maxY - minY + 1;
					if (boxW >= minBoxSize && boxH >= minBoxSize && pixelCount > minMotionPixels) {
						boxes.push({ x: minX, y: minY, w: boxW, h: boxH });
					}
				}
			}
		}
		return boxes;
	}

	function drawBoxes() {
		ctx.strokeStyle = 'red';
		ctx.lineWidth = 2;
		for (const box of boundingBoxes) {
			ctx.strokeRect(box.x, box.y, box.w, box.h);
		}
		ctx.lineWidth = 1;
		for (const track of tracks) {
			if (track.path.length < 2) continue;
			ctx.beginPath();
			ctx.moveTo(track.path[0].x, track.path[0].y);
			for (let i = 1; i < track.path.length; i++) {
				ctx.lineTo(track.path[i].x, track.path[i].y);
			}
			ctx.strokeStyle = `hsl(${(track.id * 47) % 360}, 100%, 50%)`;
			ctx.stroke();
		}
	}
</script>

<div class="flex h-full w-full flex-col items-center justify-center">
	<div class="flex flex-col items-center gap-4">
		<div class="flex h-full w-full flex-col items-center justify-center">
			<div class="flex flex-col items-center gap-4">
				{#if isLoading}
					<div class="text-sm text-gray-600">Loading cameras...</div>
				{:else if errorMessage}
					<div class="text-sm text-red-600">{errorMessage}</div>
					<button onclick={getVideoDevices} class="rounded bg-blue-600 px-4 py-2 text-white">
						Retry Camera Access
					</button>
				{:else}
					<select
						bind:value={selectedDeviceId}
						class="rounded border p-1 text-sm"
						disabled={!permissionGranted || devices.length === 0}
					>
						{#if devices.length === 0}
							<option value={null}>No cameras found</option>
						{:else}
							{#each devices as device}
								<option value={device.deviceId}>
									{device.label || `Camera ${i + 1}`}
								</option>
							{/each}
						{/if}
					</select>

					<button
						onclick={initCamera}
						class="mt-2 rounded bg-blue-600 px-4 py-2 text-white"
						disabled={!selectedDeviceId}
					>
						Start Camera
					</button>
				{/if}
			</div>
		</div>

		<video bind:this={video} class="hidden" autoplay muted playsinline></video>
		<canvas bind:this={canvas} {width} {height} class="rounded border shadow"></canvas>
		<label class="text-sm">
			Use Kalman Filter:
			<input type="checkbox" bind:checked={useKalman} />
		</label>
		<div class="grid grid-cols-2 gap-2 text-sm">
			<label>
				Threshold
				<input type="range" min="1" max="100" bind:value={threshold} />
				{threshold}
			</label>
			<label>
				Min Box Size
				<input type="range" min="1" max="100" bind:value={minBoxSize} />
				{minBoxSize}
			</label>
			<label>
				Min Motion Pixels
				<input type="range" min="1" max="200" bind:value={minMotionPixels} />
				{minMotionPixels}
			</label>
			<label>
				Track Persistence
				<input type="range" min="1" max="100" bind:value={maxTrackAge} />
				{maxTrackAge}
			</label>
			<label>
				IOU Grouping Threshold
				<input type="range" min="0" max="1" step="0.01" bind:value={iouThreshold} />
				{iouThreshold}
			</label>
		</div>
		<button class="mt-2 rounded bg-blue-600 px-4 py-2 text-white" onclick={initCamera}>
			Start Motion Tracker
		</button>
	</div>
</div>
