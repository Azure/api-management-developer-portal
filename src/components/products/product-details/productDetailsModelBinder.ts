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
        return new ProductDetailsModel();
    }

    public modelToContract(model: ProductDetailsModel): Contract {
        const contract: ProductDetailsContract = {
            type: "product-details"
        };

        return contract;
    }
}
