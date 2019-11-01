import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { HistoryOfApiModel } from "./historyOfApiModel";
import { HistoryOfApiContract } from "./historyOfApiContract";
import { IPermalinkResolver } from "@paperbits/common/permalinks/IPermalinkResolver";


export class HistoryOfApiModelBinder implements IModelBinder<HistoryOfApiModel> {
    constructor(private readonly permalinkResolver: IPermalinkResolver) { }
    
    public canHandleModel(model: Object): boolean {
        return model instanceof HistoryOfApiModel;
    }

    public async contractToModel(contract: HistoryOfApiContract): Promise<HistoryOfApiModel> {
        const model = new HistoryOfApiModel();

        if (contract.detailsPageHyperlink) {
            model.detailsPageHyperlink = await this.permalinkResolver.getHyperlinkFromConfig(contract.detailsPageHyperlink);
        }

        return model;
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "historyOfApi";
    }

    public modelToContract(model: HistoryOfApiModel): Contract {
        const contract: HistoryOfApiContract = {
            type: "historyOfApi",
            detailsPageHyperlink: model.detailsPageHyperlink
                ? {
                    target: model.detailsPageHyperlink.target,
                    targetKey: model.detailsPageHyperlink.targetKey
                } : null
        };

        return contract;
    }
}