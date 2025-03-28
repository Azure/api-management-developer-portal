import { ApiContract } from "../../src/contracts/api";
import { ApiContract as SmapiApiContract } from "../models/apiContract";
import { OperationContract as SmapiOperationContract } from "../models/operationContract";
import { MapiClient } from "../mapiClient";
import { ITestApiService } from "./ITestApiService";

export class TestApiService implements ITestApiService {
    private readonly mapiClient: MapiClient
    constructor() {
        this.mapiClient = MapiClient.Instance;
    }

    public async putApi(apiId: string, apiContract: SmapiApiContract): Promise<any> {
        if (!apiId) {
            throw new Error(`Parameter "apiId" not specified.`);
        }

        return await this.mapiClient.put<ApiContract>(apiId, [], apiContract);
    }

    public async putApiProduct(productId: string, apiId: string): Promise<any> {
        if (!productId) {
            throw new Error(`Parameter "productId" not specified.`);
        }

        if (!apiId) {
            throw new Error(`Parameter "apiId" not specified.`);
        }

        const result = await this.mapiClient.put<any>(productId + "/" + apiId, undefined);
        return result;
    }

    public async putApiOperation(apiId: string, operationId: string, operationContract: SmapiOperationContract) {
        if (!apiId) throw new Error(`Parameter "apiId" not specified.`);
        if (!operationId) throw new Error(`Parameter "operationId" not specified.`);

        const result = await this.mapiClient.put(apiId + "/" + operationId, undefined, operationContract);
        return result;
    }

    public async putCorsPolicyForOperation(apiId: string, operationId: string): Promise<any> {
        if (!apiId) throw new Error(`Parameter "apiId" not specified.`);
        if (!operationId) throw new Error(`Parameter "operationId" not specified.`);

        const operationPolicy = {
            "properties": {
                "format": "rawxml",
                "value": "<policies>\n    <inbound>\n        <base />\n        <cors allow-credentials=\"false\">\n            <allowed-origins>\n                <origin>*</origin>\n            </allowed-origins>\n            <allowed-methods>\n                <method>GET</method>\n                <method>POST</method>\n            </allowed-methods>\n            <allowed-headers>\n                <header>*</header>\n            </allowed-headers>\n            <expose-headers>\n                <header>*</header>\n            </expose-headers>\n        </cors>\n    </inbound>\n    <backend>\n        <base />\n    </backend>\n    <outbound>\n        <base />\n    </outbound>\n    <on-error>\n        <base />\n    </on-error>\n</policies>"
            }
        }

        const result = await this.mapiClient.put(apiId + "/" + operationId + "/policies/policy", undefined, operationPolicy);
        return result;
    }

    public async deleteApi(apiId: string): Promise<any> {
        if (!apiId) {
            throw new Error(`Parameter "apiId" not specified.`);
        }

        const result = await this.mapiClient.delete<any>(apiId, undefined);
        return result;
    }

    public async putSchema(apiId: string, schemaId: string, schemaContract: any): Promise<any> {
        if (!apiId) {
            throw new Error(`Parameter "apiId" not specified.`);
        }

        if (!schemaId) {
            throw new Error(`Parameter "schemaId" not specified.`);
        }

        const result = await this.mapiClient.put<any>(apiId + "/schemas/" + schemaId, undefined, schemaContract);
        return result;
    }
}