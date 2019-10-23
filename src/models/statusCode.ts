import { KnownStatusCodes } from "../models/knownStatusCodes";

export class StatusCode {
    public code: number;
    public description: string;

    constructor(code: number) {
        this.code = code;

        const knownStatusCode = KnownStatusCodes.find(x => x.code.toString() === code.toString());

        if (knownStatusCode) {
            this.description = knownStatusCode.description;
        }
    }

    public toString(): string {
        if (!this.description) {
            return `${this.code} User defined status code`;
        }
        return `${this.code} ${this.description}`;
    }
}