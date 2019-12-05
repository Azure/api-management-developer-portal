import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { OperationListModel } from "./operationListModel";
import { OperationListContract } from "./operationListContract";


export class OperationListModelBinder implements IModelBinder<OperationListModel> {
    constructor(private readonly permalinkResolver: IPermalinkResolver) { }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "operationList";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof OperationListModel;
    }

    public async contractToModel(contract: OperationListContract): Promise<OperationListModel> {
        const model = new OperationListModel();

        model.allowSelection = contract.allowSelection;
        model.defaultGroupByTagToEnabled = contract.defaultGroupByTagToEnabled === true;

        if (contract.detailsPageHyperlink) {
            model.detailsPageHyperlink = await this.permalinkResolver.getHyperlinkFromConfig(contract.detailsPageHyperlink);
        }

        return model;
    }

    public modelToContract(model: OperationListModel): OperationListContract {
        const contract: OperationListContract = {
            type: "operationList",
            allowSelection: model.allowSelection,
            defaultGroupByTagToEnabled: model.defaultGroupByTagToEnabled,
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
