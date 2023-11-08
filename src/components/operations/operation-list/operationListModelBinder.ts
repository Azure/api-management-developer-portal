import { IModelBinder } from "@paperbits/common/editing";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { OperationListModel } from "./operationListModel";
import { OperationListContract } from "./operationListContract";

export class OperationListModelBinder implements IModelBinder<OperationListModel> {
    constructor(private readonly permalinkResolver: IPermalinkResolver) { }

    public async contractToModel(contract: OperationListContract): Promise<OperationListModel> {
        const model = new OperationListModel();

        model.allowSelection = contract.allowSelection;
        model.wrapText = contract.wrapText;
        model.showToggleUrlPath = contract.showToggleUrlPath;
        model.defaultShowUrlPath = contract.defaultShowUrlPath;
        model.defaultGroupByTagToEnabled = contract.defaultGroupByTagToEnabled === true;
        model.defaultAllGroupTagsExpanded = contract.defaultAllGroupTagsExpanded === true;
        model.styles = contract.styles ?? {};

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
            defaultAllGroupTagsExpanded: model.defaultAllGroupTagsExpanded,
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
