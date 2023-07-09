import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { ProductApisModel } from "./productApisModel";
import { ProductApisContract } from "./productApisContract";

export class ProductApisModelBinder implements IModelBinder<ProductApisModel> {
    constructor(private readonly permalinkResolver: IPermalinkResolver) { }

    public async contractToModel(contract: ProductApisContract): Promise<ProductApisModel> {
        const model = new ProductApisModel();
        model.layout = contract.itemStyleView || "list";
        model.styles = contract.styles ?? {};

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
                : null,
            styles: model.styles
        };

        return contract;
    }
}
