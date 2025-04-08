import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { ApplicationDetailsModel } from "./applicationDetailsModel";
import { ApplicationDetailsContract } from "./applicationDetailsContract";

export class ApplicationDetailsModelBinder implements IModelBinder<ApplicationDetailsModel> {
    constructor(private readonly permalinkResolver: IPermalinkResolver) { }
    
    public async contractToModel(contract: ApplicationDetailsContract): Promise<ApplicationDetailsModel> {
        const model = new ApplicationDetailsModel();

        model.layout = contract.itemStyleView || "list";
        model.allowViewSwitching = contract.allowViewSwitching ?? true;
        model.styles = contract.styles ?? {};

        if (contract.detailsPageHyperlink) {
            model.detailsPageHyperlink = await this.permalinkResolver.getHyperlinkFromContract(contract.detailsPageHyperlink);
        }

        return model;
    }

    public modelToContract(model: ApplicationDetailsModel): Contract {
        const contract: ApplicationDetailsContract = {
            type: "application-details",
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
