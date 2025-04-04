import { TestUtils } from "../../testUtils";
import { Resource } from "./resource";
import { OperationContract as SmapiOperationContract } from "../../models/operationContract";

export class Operation extends Resource {
    public id: string;
    public name: string;
    public method: string;

    public constructor(testId: string, id: string, method: string) {
        super(testId);
        this.id = id;
        this.name = "operation_" + id;
        this.method = method;
    }

    public getRequestContract(): SmapiOperationContract {
        return {
            id: this.id,
            name: this.name,
            properties: {
                displayName: this.name,
                description: "",
                method: this.method,
                templateParameters: [],
                urlTemplate: "/" + this.id,
            }
        };
    }

    public static getRandomOperation(testId: string) {
        return new Operation(testId, TestUtils.randomIdentifier(), "GET");
    }

    public static getPostRandomOperation(testId: string) {
        return new Operation(testId, TestUtils.randomIdentifier(), "POST");
    }
}
