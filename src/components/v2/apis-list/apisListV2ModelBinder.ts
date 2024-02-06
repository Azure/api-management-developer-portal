import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ApisListV2Model } from "./apisListV2Model";
import { ApisListV2Contract } from "./apisListV2Contract";

export class ApisListV2ModelBinder implements IModelBinder<ApisListV2Model> {
    public async contractToModel(contract: ApisListV2Contract): Promise<ApisListV2Model> {
        const model = new ApisListV2Model();
        model.initialCount = contract.initialCount || 0;
        model.styles = contract.styles;
        return model;
    }

    public modelToContract(model: ApisListV2Model): Contract {
        const contract: ApisListV2Contract = {
            type: "apis-list-v2",
            initialCount: model.initialCount,
            styles: model.styles
        };

        return contract;
    }
}
