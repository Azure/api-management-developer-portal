import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ReportsModel } from "./reportsModel";
import { ReportsContract } from "./reportsContract";

export class ReportsModelBinder implements IModelBinder<ReportsModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === "reports";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof ReportsModel;
    }

    public async contractToModel(contract: ReportsContract): Promise<ReportsModel> {
        return new ReportsModel();
    }

    public modelToContract(model: ReportsModel): Contract {
        const contract: ReportsContract = {
            type: "reports"
        };

        return contract;
    }
}
