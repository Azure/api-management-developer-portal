import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ProductListModel } from "./productListModel";
import { ProductListContract } from "./productListContract";

export class ProductListModelBinder implements IModelBinder {
    constructor(
    ) {
        this.contractToModel = this.contractToModel.bind(this);
    }

    public canHandleWidgetType(widgetType: string): boolean {
        return widgetType === "productList";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof ProductListModel;
    }

    public async contractToModel(contract: ProductListContract): Promise<ProductListModel> {
        return new ProductListModel();
    }

    public modelToContract(searchResultModel: ProductListModel): Contract {
        const contract: ProductListContract = {
            object: "block",
            type: "productList"
        };

        return contract;
    }
}
