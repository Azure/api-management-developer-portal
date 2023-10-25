import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ReportsModel } from "./reportsModel";
import { ReportsContract } from "./reportsContract";

export class ReportsModelBinder implements IModelBinder<ReportsModel> {
    public async contractToModel(contract: ReportsContract): Promise<ReportsModel> {
        const model = new ReportsModel();
        model.styles = contract.styles ?? {};
        return model;
    }

    public modelToContract(model: ReportsModel): Contract {
        const contract: ReportsContract = {
            type: "reports",
            styles: model.styles
        };
        return contract;
    }
}
