import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { DetailsOfApiModel } from "./detailsOfApiModel";
import { DetailsOfApiContract } from "./detailsOfApiContract";
import { IPermalinkResolver } from "@paperbits/common/permalinks";


export class DetailsOfApiModelBinder implements IModelBinder<DetailsOfApiModel> {
    constructor(private readonly permalinkResolver: IPermalinkResolver) { }
    public canHandleModel(model: Object): boolean {
        return model instanceof DetailsOfApiModel;
    }

    public async contractToModel(contract: DetailsOfApiContract): Promise<DetailsOfApiModel> {
        const model = new DetailsOfApiModel();

        model.allowSelection = contract.allowSelection;

        if (contract.detailsPageHyperlink) {
            model.detailsPageHyperlink = await this.permalinkResolver.getHyperlinkFromConfig(contract.detailsPageHyperlink);
        }

        return model;
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "detailsOfApi";
    }

    public modelToContract(model: DetailsOfApiModel): Contract {
        const contract: DetailsOfApiContract = {
            type: "detailsOfApi",
            allowSelection: model.allowSelection,
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
