import { OAuthService } from "./../../../services/oauthService";
import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { OperationDetailsModel } from "./operationDetailsModel";
import { OperationDetailsContract } from "./operationDetailsContract";

export class OperationDetailsModelBinder implements IModelBinder<OperationDetailsModel> {
    constructor(private readonly oauthService: OAuthService) {
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "operationDetails";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof OperationDetailsModel;
    }

    public async contractToModel(contract: OperationDetailsContract): Promise<OperationDetailsModel> {
        const model = new OperationDetailsModel();
        model.enableConsole = contract.enableConsole === true || contract.enableConsole === undefined;
        model.authorizationServers = await this.oauthService.getOAuthServers();

        return model;
    }

    public modelToContract(model: OperationDetailsModel): Contract {
        const contract: OperationDetailsContract = {
            type: "operationDetails",
            enableConsole: model.enableConsole
        };

        return contract;
    }
}
