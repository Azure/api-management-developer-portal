import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { ProductApisModel } from "./productApisModel";
import { ProductApisContract } from "./productApisContract";

export class ProductApisModelBinder implements IModelBinder<ProductApisModel> {
    constructor(private readonly permalinkResolver: IPermalinkResolver) { }
    
    public canHandleContract(contract: Contract): boolean {
        return contract.type === "product-apis";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof ProductApisModel;
    }

    public async contractToModel(contract: ProductApisContract): Promise<ProductApisModel> {
        const model = new ProductApisModel();
        model.layout = contract.itemStyleView || "list";

        if (contract.detailsPageHyperlink) {
            model.detailsPageHyperlink = await this.permalinkResolver.getHyperlinkFromContract(contract.detailsPageHyperlink);
        }

        return model;
    }

    public modelToContract(model: ProductApisModel): ProductApisContract {
        const contract: ProductApisContract = {
            type: "product-apis",
            itemStyleView: model.layout,
            detailsPageHyperlink: model.detailsPageHyperlink
            ? {
                target: model.detailsPageHyperlink.target,
                targetKey: model.detailsPageHyperlink.targetKey
            }
            : null
        };

        return contract;
    }
}
