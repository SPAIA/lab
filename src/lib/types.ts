export interface Sensor {
	id: number;
	name: string | null;
	model: string | null;
	typeId: number;
	description: string | null;
	createdAt: Date;
	updatedAt: Date;
}

// Sensor reading data
export interface SensorData {
	id: number;
	sensorId: number | null;
	eventId: number | null;
	value: number | null;
	createdAt: Date;
	updatedAt: Date;
	sensor?: Sensor; // Optional joined sensor details
}

export interface Label {
	id: number;
	name: string | null;
	latinName: string | null;
	count: number | null;
	createdAt: Date;
	updatedAt: Date;
	labels: Label[];
}
export interface Region {
	id: number;
	eventId: number | null;
	w: number | null;
	h: number | null;
	x: number | null;
	y: number | null;
	createdAt: Date;
	updatedAt: Date;
}
export interface SPAIAMedia {
	id: number;
	fileId: string;
	source?: string;
}
// Add your data types here too - keeps everything clean
export interface SPAIAEvent {
	id: number;
	time: Date | null;
	type: string | null;
	deviceId: number;
	location: string | null; // We'll handle the geometry type as a string for now
	verifiedBy: string | null;
	verifiedAt: string | null;
	createdAt: Date;
	updatedAt: Date;
	updatedBy: string | null;
	regions: Region[];
	sensorData: SensorData[];
	media: SPAIAMedia[];
	sensordata?: { value: string; name: string }[]
}

export interface Device {
	id: number;
	typeId: number | null;
	name: string | null;
	serial: string | null;
	notes: string | null;
	updatedBy: string | null;
	createdAt: Date | null;
	createdBy: string;
	updatedAt: Date;
	ip: string | null;
	lastSeen: Date | null;
}
export interface ApiResponse<T> {
	data: T;
	pagination?: {
		currentPage: number;
		totalPages: number;
		totalCount: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	};
	error?: string;
}

export interface DeviceSettings {
	uploadFrequency: string;
	wifiPassword?: string;
	ssid?: string;
	sensors?: string[]
	deviceName?: string;
	serial?: string;
}

export interface Sighting {
	group: string;
	count: string;
	behavior: string;
	where: string;
	notes: string;
	time: Date
}
interface GeoCoordinates {
	lat: number;
	lng: number;
}

interface DateTimeFields {
	date: Date;
	time: string;
	created_at: Date;
}


type ObservationType = "transect" | "point" | "area" | "fit"; // Add other possible types
type Season = "Spring" | "Summer" | "Autumn" | "Winter";

export interface FieldObservation {
	id: string;
	user_id: string;
	type: ObservationType;
	location: GeoCoordinates | string; // Can handle both formats
	weather: string;
	temperature: number;
	wind: string;
	season: Season;
	consent: boolean;
	date: string; // ISO date string (could also use Date type if you parse it)
	time: string; // HH:MM:SS format
}
