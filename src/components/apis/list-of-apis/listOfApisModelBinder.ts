import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ListOfApisModel } from "./listOfApisModel";
import { ListOfApisContract } from "./listOfApisContract";
import { IPermalinkResolver } from "@paperbits/common/permalinks";


export class ListOfApisModelBinder implements IModelBinder<ListOfApisModel> {
    constructor(private readonly permalinkResolver: IPermalinkResolver) { }
    
    public canHandleModel(model: Object): boolean {
        return model instanceof ListOfApisModel;
    }

    public async contractToModel(contract: ListOfApisContract): Promise<ListOfApisModel> {
        const model = new ListOfApisModel();
        
        model.layout = contract.itemStyleView;
        model.allowSelection = contract.allowSelection;
        model.showApiType = contract.showApiType === undefined ? true : contract.showApiType;
        model.defaultGroupByTagToEnabled = contract.defaultGroupByTagToEnabled === true;

        if (contract.detailsPageHyperlink) {
            model.detailsPageHyperlink = await this.permalinkResolver.getHyperlinkFromContract(contract.detailsPageHyperlink);
        }

        return model;
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "listOfApis";
    }

    public modelToContract(model: ListOfApisModel): Contract {
        const contract: ListOfApisContract = {
            type: "listOfApis",
            itemStyleView: model.layout,
            allowSelection: model.allowSelection,
            showApiType: model.showApiType,
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
