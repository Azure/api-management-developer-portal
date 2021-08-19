import { widgetName } from "./constants";
import { IModelBinder } from "@paperbits/common/editing";
import { BemoNavbarModel } from "./bemoNavbarModel";
import { Contract } from "@paperbits/common";
import { BemoNavbarContract } from "./bemoNavbarContract";

/**
 * This is a class that helps to prepare the model using data described
 * in the contract.
 */
export class BemoNavbarModelBinder implements IModelBinder<BemoNavbarModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === widgetName;
    }

    public canHandleModel(model: any): boolean {
        return model instanceof BemoNavbarModel;
    }

    public async contractToModel(contract: BemoNavbarContract): Promise<BemoNavbarModel> {
        const model = new BemoNavbarModel();
        // model.property = contract.property;
        return model;
    }

    public modelToContract(model: BemoNavbarModel): Contract {
        const contract: BemoNavbarContract = {
            type: widgetName,
            // property: model.property
        };

        return contract;
    }
}
