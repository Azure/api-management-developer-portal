import { Contract, Bag } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ApiDetailsPageContract } from "./apiDetailsPageContract";
import { ApiDetailsPageModel } from "./apiDetailsPageModel";

export class ApiDetailsPageModelBinder implements IModelBinder<ApiDetailsPageModel> {
    canHandleContract?(contract: Contract): boolean {
        return contract.type === "apiDetailsPage";
    }
    canHandleModel?(model: ApiDetailsPageModel, widgetName?: string): boolean {
        return model instanceof ApiDetailsPageModel;
    }
    modelToContract(model: ApiDetailsPageModel): Contract {
        return { type: "apiDetailsPage", styles: model.styles } as ApiDetailsPageContract;
    }
    public async contractToModel(contract: any, bindingContext?: Bag<any>): Promise<ApiDetailsPageModel> {
        const model = new ApiDetailsPageModel();
        model.styles = contract.srtyles || {};

        return model;

    }

}