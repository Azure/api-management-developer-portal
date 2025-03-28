import { TestUtils } from "../../testUtils";
import { ApiContract } from "../../../src/contracts/api";
import { Resource } from "./resource";
import { ApiContract as SmapiApiContract } from "../../models/apiContract";

export class Api extends Resource{
    public apiId: string;
    public apiName: string;
    public path: string;
    public protocols: string[] = ["https"];
    public responseContract: ApiContract;
    public subscriptionRequired: boolean = true;
    
    public constructor(testId: string ,apiId: string, apiName: string, path: string, protocols?: string[], subscriptionRequired?: boolean){
        super(testId);
        this.apiId = apiId;
        this.apiName = apiName;
        this.path = path;
        this.protocols = protocols || this.protocols;
        this.responseContract = this.getResponseContract();
    }
    
    public getRequestContract(): SmapiApiContract {
        return {
            properties: {
                displayName: this.apiName,
                description: "",
                subscriptionRequired: this.subscriptionRequired,
                path: this.path,
                protocols: this.protocols,
            }
        };
    }

    public getResponseContract(): ApiContract{
        return {
            id : this.apiId,
            name : this.apiName,
            path : this.path,
            protocols : this.protocols,
            subscriptionRequired : true,
        }
    }

    public static getRandomApi(testId: string){
        return new Api(testId, TestUtils.randomIdentifier(), TestUtils.randomIdentifier(), TestUtils.randomIdentifier());
    }
}
