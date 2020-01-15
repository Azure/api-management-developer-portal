import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ConferenceSessionEditor } from "./ko/conferenceSessionEditorViewModel";
import { ConferenceSessionHandlers } from "./conferenceSessionHandlers";
import { ConferenceSessionViewModel, ConferenceSessionViewModelBinder } from "./ko";
import { ConferenceSessionModelBinder } from ".";


export class ConferenceSessionDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("conferenceSession", ConferenceSessionViewModel);
        injector.bind("conferenceSessionEditor", ConferenceSessionEditor);
        injector.bindToCollection("modelBinders", ConferenceSessionModelBinder);
        injector.bindToCollection("viewModelBinders", ConferenceSessionViewModelBinder);
        injector.bindToCollection("widgetHandlers", ConferenceSessionHandlers);
    }
}