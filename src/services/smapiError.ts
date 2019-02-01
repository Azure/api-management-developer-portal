export interface SmapiErrorDetails {
    target: string;
    message: string;
}

export class SmapiError extends Error {
    constructor(
        public readonly code: string,
        public readonly message: string,
        public readonly details?: SmapiErrorDetails[]
    ) {
        super();
        Object.setPrototypeOf(this, SmapiError.prototype);
    }

    public toString(): string {
        return `${this.code}: ${this.message}`;
    }
}