export class AppError extends Error {
    constructor(
        public readonly message: string,
        public readonly innerError?: Error
    ) {
        super();
        Object.setPrototypeOf(this, AppError.prototype);
    }

    public toString(): string {
        return `${this.stack} `;
    }
}