import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ConferenceSessionViewModel } from "./ko/conferenceSessionViewModel";
import { ConferenceSessionModelBinder } from "./conferenceSessionModelBinder";
import { ConferenceSessionViewModelBinder } from "./ko/conferenceSessionViewModelBinder";


export class ConferenceSessionPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {        
        injector.bind("conferenceSession", ConferenceSessionViewModel);
        injector.bindToCollection("modelBinders", ConferenceSessionModelBinder);
        injector.bindToCollection("viewModelBinders", ConferenceSessionViewModelBinder);
    }
}