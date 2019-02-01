export interface WsdlParsingResult {
    events: ParsingEvent[];
}

export interface ParsingEvent {
    level: string;
    event: string;
    message: string;
}