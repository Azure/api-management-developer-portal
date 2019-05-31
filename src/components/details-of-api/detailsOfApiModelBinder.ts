import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { DetailsOfApiModel } from "./detailsOfApiModel";
import { DetailsOfApiContract } from "./detailsOfApiContract";


export class DetailsOfApiModelBinder implements IModelBinder {
    public canHandleModel(model: Object): boolean {
        return model instanceof DetailsOfApiModel;
    }

    public async contractToModel(contract: DetailsOfApiContract): Promise<DetailsOfApiModel> {
        return new DetailsOfApiModel();
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "detailsOfApi";
    }

    public modelToContract(searchResultModel: DetailsOfApiModel): Contract {
        const searchResultConfig: DetailsOfApiContract = {
            type: "detailsOfApi"
        };

        return searchResultConfig;
    }
}
