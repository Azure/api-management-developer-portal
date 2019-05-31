import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ProductListModel } from "./productListModel";
import { ProductListContract } from "./productListContract";

export class ProductListModelBinder implements IModelBinder {
    public canHandleModel(model: Object): boolean {
        return model instanceof ProductListModel;
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "productList";
    }

    public async contractToModel(contract: ProductListContract): Promise<ProductListModel> {
        return new ProductListModel();
    }

    public modelToContract(searchResultModel: ProductListModel): Contract {
        const contract: ProductListContract = {
            type: "productList"
        };

        return contract;
    }
}
