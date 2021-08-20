import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ProductSubscribeModel } from "./productSubscribeModel";
import { ProductSubscribeContract } from "./productSubscribeContract";

export class ProductSubscribeModelBinder implements IModelBinder<ProductSubscribeModel> {
    public canHandleModel(model: any): boolean {
        return model instanceof ProductSubscribeModel;
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "product-subscribe"
            || contract.type === "productSubscribe"; // for backward compatibility
    }

    public async contractToModel(contract: ProductSubscribeContract): Promise<ProductSubscribeModel> {
		const model = new ProductSubscribeModel();
		
	    model.showTermsByDefault = contract.showTermsByDefault;
			   
	    return model;
    }

    public modelToContract(model: ProductSubscribeModel): Contract {
        const contract: ProductSubscribeContract = {
            type: "product-subscribe",
			showTermsByDefault: model.showTermsByDefault
        };

        return contract;
    }
}
