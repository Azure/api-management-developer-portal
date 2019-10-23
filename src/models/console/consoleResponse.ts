import { ConsoleHeader } from "./consoleHeader";
import { ConsoleRepresentation } from "./consoleRepresentation";
// import { ValidateNested } from "class-validator";
import { StatusCode } from "../statusCode";
import { Response } from "../response";

export class ConsoleResponse {
    // @ValidateNested()
    public headers: ConsoleHeader[];

    // @ValidateNested()
    public statusCode: StatusCode;

    // @ValidateNested()
    public representations: ConsoleRepresentation[];

    public description: string;

    constructor(response: Response) {
        this.statusCode = response.statusCode;
        this.description = response.description;
        this.headers = response.headers.map(x => new ConsoleHeader(x));

        if (!this.headers) {
            this.headers = [];
        }

        this.representations = response.representations.map(x => new ConsoleRepresentation(x));

        if (!this.representations) {
            this.representations = [];
        }
    }
}