import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ProductSubscribeModel } from "./productSubscribeModel";
import { ProductSubscribeContract } from "./productSubscribeContract";


export class ProductSubscribeModelBinder implements IModelBinder<ProductSubscribeModel> {
    public async contractToModel(contract: ProductSubscribeContract): Promise<ProductSubscribeModel> {
        const model = new ProductSubscribeModel();

        model.showTermsByDefault = contract.showTermsByDefault;
        model.styles = contract.styles ?? {};

        return model;
    }

    public modelToContract(model: ProductSubscribeModel): Contract {
        const contract: ProductSubscribeContract = {
            type: "product-subscribe",
            showTermsByDefault: model.showTermsByDefault,
            styles: model.styles
        };

        return contract;
    }
}
