
import { StylePublishModule } from "@paperbits/styles/styles.publish.module";
import { IInjector } from "@paperbits/common/injection";
import { ApimDefaultStyleCompiler } from "./apimDefaultStyleCompiler";

export class ApimStylePublishModule extends StylePublishModule {
    public register(injector: IInjector): void {
        super.register(injector);
        injector.bindSingleton("styleCompiler", ApimDefaultStyleCompiler);
    }
}