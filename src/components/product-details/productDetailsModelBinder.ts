import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ProductDetailsModel } from "./productDetailsModel";
import { ProductDetailsContract } from "./productDetailsContract";

export class ProductDetailsModelBinder implements IModelBinder {
    public canHandleWidgetType(widgetType: string): boolean {
        return widgetType === "productDetails";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof ProductDetailsModel;
    }

    public async contractToModel(contract: ProductDetailsContract): Promise<ProductDetailsModel> {
        return new ProductDetailsModel();
    }

    public modelToContract(searchResultModel: ProductDetailsModel): Contract {
        const contract: ProductDetailsContract = {
            object: "block",
            type: "productDetails"
        };

        return contract;
    }
}
