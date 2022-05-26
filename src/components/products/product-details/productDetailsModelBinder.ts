import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ProductDetailsModel } from "./productDetailsModel";
import { ProductDetailsContract } from "./productDetailsContract";

export class ProductDetailsModelBinder implements IModelBinder<ProductDetailsModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === "product-details"
            || contract.type === "productDetails"; // for backward compatibility
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof ProductDetailsModel;
    }

    public async contractToModel(contract: ProductDetailsContract): Promise<ProductDetailsModel> {
        const model = new ProductDetailsModel();
        model.styles = contract.styles ?? {};

        return model;
    }

    public modelToContract(model: ProductDetailsModel): Contract {
        const contract: ProductDetailsContract = {
            type: "product-details",
            styles: model.styles
        };

        return contract;
    }
}
