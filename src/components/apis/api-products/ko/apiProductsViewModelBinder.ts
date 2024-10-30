import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ISiteService } from "@paperbits/common/sites/ISiteService";
import { ApiProductsModel } from "../apiProductsModel";
import { ApiProductsViewModel } from "./apiProductsViewModel";
import { isRedesignEnabledSetting } from "../../../../constants";
import { layoutsMap } from "../../../utils/react/TableListInfo";

export class ApiProductsViewModelBinder implements ViewModelBinder<ApiProductsModel, ApiProductsViewModel> {
    constructor(
        private readonly siteService: ISiteService,
    ) {}

    public stateToInstance(state: WidgetState, componentInstance: ApiProductsViewModel): void {
        componentInstance.layout(state.layout);
        componentInstance.runtimeConfig(JSON.stringify({
            detailsPageUrl: state.detailsPageUrl,
            layoutDefault: layoutsMap[state.layout]
        }));

        componentInstance.isRedesignEnabled(state.isRedesignEnabled);
    }

    public async modelToState(model: ApiProductsModel, state: WidgetState): Promise<void> {
        state.layout = model.layout;
        state.detailsPageUrl = model.detailsPageHyperlink
            ? model.detailsPageHyperlink.href
            : undefined

        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}