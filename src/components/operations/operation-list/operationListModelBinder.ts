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
        model.wrapText = contract.wrapText;
        model.showToggleUrlPath = contract.showToggleUrlPath;
        model.defaultShowUrlPath = contract.defaultShowUrlPath;
        model.defaultGroupByTagToEnabled = contract.defaultGroupByTagToEnabled === true;

        if (contract.detailsPageHyperlink) {
            model.detailsPageHyperlink = await this.permalinkResolver.getHyperlinkFromContract(contract.detailsPageHyperlink);
        }

        return model;
    }

    public modelToContract(model: OperationListModel): OperationListContract {
        const contract: OperationListContract = {
            type: "operationList",
            allowSelection: model.allowSelection,
            wrapText: model.wrapText,
            showToggleUrlPath: model.showToggleUrlPath,
            defaultShowUrlPath: model.defaultShowUrlPath,
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
