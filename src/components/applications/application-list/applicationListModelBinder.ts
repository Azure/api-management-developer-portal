import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { ApplicationListModel } from "./applicationListModel";
import { ApplicationListContract } from "./applicationListContract";

export class ApplicationListModelBinder implements IModelBinder<ApplicationListModel> {
    constructor(private readonly permalinkResolver: IPermalinkResolver) { }
    
    public async contractToModel(contract: ApplicationListContract): Promise<ApplicationListModel> {
        const model = new ApplicationListModel();

        model.layout = contract.itemStyleView || "list";
        model.allowViewSwitching = contract.allowViewSwitching ?? true;
        model.styles = contract.styles ?? {};

        if (contract.detailsPageHyperlink) {
            model.detailsPageHyperlink = await this.permalinkResolver.getHyperlinkFromContract(contract.detailsPageHyperlink);
        }

        return model;
    }

    public modelToContract(model: ApplicationListModel): Contract {
        const contract: ApplicationListContract = {
            type: "application-list",
            itemStyleView: model.layout,
            allowViewSwitching: model.allowViewSwitching,
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
