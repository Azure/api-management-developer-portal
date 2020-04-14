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

        if (contract.changeLogPageHyperlink) {
            model.changeLogPageHyperlink = await this.permalinkResolver.getHyperlinkFromContract(contract.changeLogPageHyperlink);
        }

        return model;
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "detailsOfApi";
    }

    public modelToContract(model: DetailsOfApiModel): Contract {
        const searchResultConfig: DetailsOfApiContract = {
            type: "detailsOfApi",
            changeLogPageHyperlink: model.changeLogPageHyperlink
                ? {
                    target: model.changeLogPageHyperlink.target,
                    targetKey: model.changeLogPageHyperlink.targetKey
                } : null
        };

        return searchResultConfig;
    }
}
