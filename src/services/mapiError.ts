export interface SmapiErrorDetails {
    target: string;
    message: string;
}

export class MapiError extends Error {
    constructor(
        public readonly code: string,
        public readonly message: string,
        public readonly details?: SmapiErrorDetails[]
    ) {
        super();
        Object.setPrototypeOf(this, MapiError.prototype);
    }

    public toString(): string {
        return `${this.code}: ${this.message}`;
    }
}