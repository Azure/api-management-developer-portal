import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { HistoryOfApiModel } from "./historyOfApiModel";
import { HistoryOfApiContract } from "./historyOfApiContract";


export class HistoryOfApiModelBinder implements IModelBinder<HistoryOfApiModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof HistoryOfApiModel;
    }

    public async contractToModel(contract: HistoryOfApiContract): Promise<HistoryOfApiModel> {
        return new HistoryOfApiModel();
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "historyOfApi";
    }

    public modelToContract(model: HistoryOfApiModel): Contract {
        const searchResultConfig: HistoryOfApiContract = {
            type: "historyOfApi"
        };

        return searchResultConfig;
    }
}