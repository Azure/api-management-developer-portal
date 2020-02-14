import { HttpResponse } from "@paperbits/common/http";

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

    public static fromResponse(response: HttpResponse<any>): MapiError {
        const responseObject = response.toObject();
        const code = responseObject?.error?.code || "Error";
        const message = responseObject?.error?.message || "Server error";
        const details = responseObject?.error?.details || [];

        return new MapiError(code, message, details);
    }

    public toString(): string {
        return `${this.code}: ${this.message}`;
    }
}