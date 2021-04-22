export class UnauthorizedError extends Error {
    constructor(
        public readonly message: string,
        public readonly innerError?: Error
    ) {
        super();
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }

    public toString(): string {
        return `${this.stack} `;
    }
}