import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ProductSubscribeModel } from "./productSubscribeModel";
import { ProductSubscribeContract } from "./productSubscribeContract";

export class ProductSubscribeModelBinder implements IModelBinder {
    public canHandleModel(model: any): boolean {
        return model instanceof ProductSubscribeModel;
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "productSubscribe";
    }

    public async contractToModel(contract: ProductSubscribeContract): Promise<ProductSubscribeModel> {
        return new ProductSubscribeModel();
    }

    public modelToContract(searchResultModel: ProductSubscribeModel): Contract {
        const contract: ProductSubscribeContract = {
            type: "productSubscribe"
        };

        return contract;
    }
}
