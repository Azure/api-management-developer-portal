
export class UnhandledErrorHandler {
    constructor(
    ) {
        window.addEventListener("error", this.handlerError.bind(this), false);
    }

    public handlerError(event: ErrorEvent): void {
       // debugger;
       alert("oops, something went wrong!");
    }
}