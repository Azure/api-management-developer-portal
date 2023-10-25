import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { ProductListModel } from "./productListModel";
import { ProductListContract } from "./productListContract";


export class ProductListModelBinder implements IModelBinder<ProductListModel> {
    constructor(private readonly permalinkResolver: IPermalinkResolver) { }

    public async contractToModel(contract: ProductListContract): Promise<ProductListModel> {
        const model = new ProductListModel();

        model.layout = contract.itemStyleView || "list";

        model.allowSelection = contract.allowSelection;
        model.styles = contract.styles ?? {};

        if (contract.detailsPageHyperlink) {
            model.detailsPageHyperlink = await this.permalinkResolver.getHyperlinkFromContract(contract.detailsPageHyperlink);
        }

        return model;
    }

    public modelToContract(model: ProductListModel): Contract {
        const contract: ProductListContract = {
            type: "product-list",
            itemStyleView: model.layout,
            allowSelection: model.allowSelection,
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
