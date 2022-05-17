import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ProductSubscriptionsModel } from "./productSubscriptionsModel";
import { ProductSubscriptionsContract } from "./productSubscriptionsContract";

export class ProductSubscriptionsModelBinder implements IModelBinder<ProductSubscriptionsModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === "product-subscriptions";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof ProductSubscriptionsModel;
    }

    public async contractToModel(contract: ProductSubscriptionsContract): Promise<ProductSubscriptionsModel> {
        const model = new ProductSubscriptionsModel();
        model.styles = contract.styles || {};

        return model;
    }

    public modelToContract(model: ProductSubscriptionsModel): Contract {
        const contract: ProductSubscriptionsContract = {
            type: "product-subscriptions",
            styles: model.styles
        };

        return contract;
    }
}
