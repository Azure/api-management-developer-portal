import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ApplicationListModel } from "./applicationListModel";
import { ApplicationListContract } from "./applicationListContract";

export class ApplicationListModelBinder implements IModelBinder<ApplicationListModel> {
    public async contractToModel(contract: ApplicationListContract): Promise<ApplicationListModel> {
        const model = new ApplicationListModel();
        model.styles = contract.styles ?? {};
        return model;
    }

    public modelToContract(model: ApplicationListModel): Contract {
        const contract: ApplicationListContract = {
            type: "application-list",
            styles: model.styles
        };

        return contract;
    }
}
