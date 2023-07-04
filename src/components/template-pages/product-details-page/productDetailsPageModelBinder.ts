import { IModelBinder } from "@paperbits/common/editing";
import { ProductDetailsPageModel } from "./productDetailsPageModel";
import { Contract, Bag } from "@paperbits/common";
import { ProductDetailsPageContract } from "./productDetailsPageContract";

export class ProductDetailsPageModelBinder implements IModelBinder<ProductDetailsPageModel>{
    public canHandleContract?(contract: Contract): boolean {
        return contract.type === "productDetailsPage"
    }

    public canHandleModel?(model: ProductDetailsPageModel, widgetName?: string): boolean {
        return model instanceof ProductDetailsPageModel;
    }

    public modelToContract(model: ProductDetailsPageModel): ProductDetailsPageContract {
        const contract = {
            type: "productDetailsPage",
            styles: model.styles,
            wrapText: model.wrapText
        };

        return contract;
    }

    public async contractToModel(contract: any, bindingContext?: Bag<any>): Promise<ProductDetailsPageModel> {
        const model = new ProductDetailsPageModel();
        model.styles = contract.styles || {};
        model.wrapText = contract.wrapText || false;

        return model;
    }
}