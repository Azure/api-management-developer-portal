export class RequestError extends Error {
    constructor(public readonly message: string) {
        super();
        Object.setPrototypeOf(this, RequestError.prototype);
    }

    public toString(): string {
        return `${this.stack} `;
    }
}