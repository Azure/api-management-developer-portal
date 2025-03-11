import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ISiteService } from "@paperbits/common/sites/ISiteService";
import { Logger } from "@paperbits/common/logging";
import { isRedesignEnabledSetting } from "../../../constants";
import { layoutsMap } from "../../utils/react/TableListInfo";
import { ApiProductsModel } from "./apiProductsModel";
import { ApiProductsViewModel } from "./react/ApiProductsViewModel";

export class ApiProductsViewModelBinder implements ViewModelBinder<ApiProductsModel, ApiProductsViewModel> {
    constructor(
        private readonly siteService: ISiteService,
        private readonly logger: Logger
    ) {}

    public stateToInstance(state: WidgetState, componentInstance: ApiProductsViewModel): void {
        componentInstance.setState(prevState => ({
            isRedesignEnabled: state.isRedesignEnabled,
            detailsPageUrl: state.detailsPageUrl,
            layout: state.layout,
            layoutDefault: layoutsMap[state.layout]
        }));
    }

    public async modelToState(model: ApiProductsModel, state: WidgetState): Promise<void> {
        state.layout = model.layout;
        state.detailsPageUrl = model.detailsPageHyperlink
            ? model.detailsPageHyperlink.href
            : undefined

        let isRedesignEnabled = false;
        
        try {
            isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
        } catch (error) {
            this.logger?.trackError(error, { message: `Failed to get setting: ${isRedesignEnabledSetting} - ApiProductsViewModelBinder` });
        } finally {
            state.isRedesignEnabled = isRedesignEnabled;
        }
    }
}