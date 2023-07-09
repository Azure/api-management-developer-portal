import { IModelBinder } from "@paperbits/common/editing";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { ApiProductsModel } from "./apiProductsModel";
import { ApiProductsContract } from "./apiProductsContract";

export class ApiProductsModelBinder implements IModelBinder<ApiProductsModel> {
    constructor(private readonly permalinkResolver: IPermalinkResolver) { }

    public async contractToModel(contract: ApiProductsContract): Promise<ApiProductsModel> {
        const model = new ApiProductsModel();
        model.layout = contract.itemStyleView || "list";

        if (contract.detailsPageHyperlink) {
            model.detailsPageHyperlink = await this.permalinkResolver.getHyperlinkFromContract(contract.detailsPageHyperlink);
        }

        return model;
    }

    public modelToContract(model: ApiProductsModel): ApiProductsContract {
        const contract: ApiProductsContract = {
            type: "api-products",
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
