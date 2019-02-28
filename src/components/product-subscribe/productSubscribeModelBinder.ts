import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ProductSubscribeModel } from "./productSubscribeModel";
import { ProductSubscribeContract } from "./productSubscribeContract";

export class ProductSubscribeModelBinder implements IModelBinder {
    public canHandleWidgetType(widgetType: string): boolean {
        return widgetType === "productSubscribe";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof ProductSubscribeModel;
    }

    public async contractToModel(contract: ProductSubscribeContract): Promise<ProductSubscribeModel> {
        return new ProductSubscribeModel();
    }

    public modelToContract(searchResultModel: ProductSubscribeModel): Contract {
        const contract: ProductSubscribeContract = {
            object: "block",
            type: "productSubscribe"
        };

        return contract;
    }
}
