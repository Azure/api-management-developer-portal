import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ListOfApisModel } from "./listOfApisModel";
import { FiltersPosition, ListOfApisContract } from "./listOfApisContract";
import { IPermalinkResolver } from "@paperbits/common/permalinks";


export class ListOfApisModelBinder implements IModelBinder<ListOfApisModel> {
    constructor(private readonly permalinkResolver: IPermalinkResolver) { }

    public async contractToModel(contract: ListOfApisContract): Promise<ListOfApisModel> {
        const model = new ListOfApisModel();

        model.layout = contract.itemStyleView;
        model.allowSelection = contract.allowSelection;
        model.allowViewSwitching = contract.allowViewSwitching ?? true;
        model.filtersPosition = contract.filtersPosition ?? FiltersPosition.popup;
        model.showApiType = contract.showApiType === undefined ? true : contract.showApiType;
        model.defaultGroupByTagToEnabled = contract.defaultGroupByTagToEnabled === true;
        model.styles = contract.styles ?? {};

        if (contract.detailsPageHyperlink) {
            model.detailsPageHyperlink = await this.permalinkResolver.getHyperlinkFromContract(contract.detailsPageHyperlink);
        }

        return model;
    }

    public modelToContract(model: ListOfApisModel): Contract {
        const contract: ListOfApisContract = {
            type: "listOfApis",
            itemStyleView: model.layout,
            allowSelection: model.allowSelection,
            allowViewSwitching: model.allowViewSwitching,
            filtersPosition: model.filtersPosition,
            showApiType: model.showApiType,
            defaultGroupByTagToEnabled: model.defaultGroupByTagToEnabled,
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
