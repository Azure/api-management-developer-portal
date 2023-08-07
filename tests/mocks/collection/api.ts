import { TestUtils } from "../../testUtils";
import { ApiContract } from "../../../src/contracts/api";
import { Resource } from "./resource";

export class Api extends Resource{
    public apiId: string;
    public apiName: string;
    public path: string;
    public protocols: string[] = ["https"];
    public responseContract: ApiContract;
    
    public constructor(testId: string ,apiId: string, apiName: string, path: string, protocols?: string[]){
        super(testId);
        this.apiId = apiId;
        this.apiName = apiName;
        this.path = path;
        this.protocols = protocols || this.protocols;

        this.responseContract = this.getResponseContract();
    }

    private getProperties(): any{
        return {
            displayName: this.apiName,
            description: "",
            subscriptionRequired: true,
            path: this.path,
            protocols: this.protocols,
        };
    }
    
    public getContract(): ApiContract {
        return {
            properties: this.getProperties()
        };
    }

    public getResponseContract(): ApiContract{
        return {
            id: `/subscriptions/sid/resourceGroups/rgid/providers/Microsoft.ApiManagement/service/sid/apis/${this.apiId}`,
            type: "Microsoft.ApiManagement/service/apis",
            name: this.apiId,
            properties: this.getProperties()
        };
    }

    public static getRandomApi(testId: string){
        return new Api(testId, TestUtils.randomIdentifier(), TestUtils.randomIdentifier(), TestUtils.randomIdentifier());
    }
}
