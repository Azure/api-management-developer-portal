import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ProductListModel } from "./productListModel";
import { ProductListContract } from "./productListContract";

export class ProductListModelBinder implements IModelBinder<ProductListModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof ProductListModel;
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "product-list"
            || contract.type === "productList"; // for backward compatibility
    }

    public async contractToModel(contract: ProductListContract): Promise<ProductListModel> {
        const model = new ProductListModel();
        model.itemStyleView = contract.itemStyleView;
        return model;
    }

    public modelToContract(model: ProductListModel): Contract {
        const contract: ProductListContract = {
            type: "product-list",
            itemStyleView: model.itemStyleView
        };

        return contract;
    }
}
