export interface TraceEntry {
	source: string;
	timestamp: string;
	elapsed: string;
	data: any;
}

export interface TraceEntries {
	inbound: TraceEntry[];
	backend: TraceEntry[];
	outbound: TraceEntry[];
}

export interface Trace {
	traceId: string;
	traceEntries: TraceEntries;
}