import { Bag } from "@paperbits/common";
import { EventManager } from "@paperbits/common/events";
import { IWidgetBinding } from "@paperbits/common/editing";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { ConferenceSessionViewModel } from "./conferenceSessionViewModel";
import { widgetName, widgetDisplayName, widgetEditorSelector } from "../constants";
import { ConferenceSessionModel } from "../conferenceSessionModel";


export class ConferenceSessionViewModelBinder implements ViewModelBinder<ConferenceSessionModel, ConferenceSessionViewModel>  {
    constructor(private readonly eventManager: EventManager) { }

    public async updateViewModel(model: ConferenceSessionModel, viewModel: ConferenceSessionViewModel): Promise<void> {
        viewModel.runtimeConfig(JSON.stringify({ sessionNumber: model.sessionNumber }));
    }

    public async modelToViewModel(model: ConferenceSessionModel, viewModel?: ConferenceSessionViewModel, bindingContext?: Bag<any>): Promise<ConferenceSessionViewModel> {
        if (!viewModel) {
            viewModel = new ConferenceSessionViewModel();

            const binding: IWidgetBinding<ConferenceSessionModel, ConferenceSessionViewModel> = {
                name: widgetName,
                displayName: widgetDisplayName,
                readonly: bindingContext?.readonly,
                model: model,
                draggable: true,
                flow: "block",
                editor: widgetEditorSelector,
                applyChanges: async () => {
                    await this.updateViewModel(model, viewModel);
                    this.eventManager.dispatchEvent("onContentUpdate");
                }
            };
            viewModel["widgetBinding"] = binding;
        }

        this.updateViewModel(model, viewModel);

        return viewModel;
    }

    public canHandleModel(model: ConferenceSessionModel): boolean {
        return model instanceof ConferenceSessionModel;
    }
}