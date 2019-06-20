import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ProductApisModel } from "./productApisModel";
import { ProductApisContract } from "./productApisContract";

export class ProductApisModelBinder implements IModelBinder<ProductApisModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === "product-apis";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof ProductApisModel;
    }

    public async contractToModel(contract: ProductApisContract): Promise<ProductApisModel> {
        return new ProductApisModel();
    }

    public modelToContract(model: ProductApisModel): Contract {
        const contract: ProductApisContract = {
            type: "product-apis"
        };

        return contract;
    }
}
