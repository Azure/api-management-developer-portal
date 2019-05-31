import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { SetupDialog } from "./setupDialog";


export class SetupModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("setupDialog", SetupDialog);
    }
}