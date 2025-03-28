import { StylesDesignModule } from "@paperbits/styles/styles.design.module";
import { IInjector } from "@paperbits/common/injection";
import { ApimDefaultStyleCompiler } from './apimDefaultStyleCompiler';

export class ApimStylesDesignModule extends StylesDesignModule {
    public register(injector: IInjector): void {
        super.register(injector);
        injector.bindSingleton("styleCompiler", ApimDefaultStyleCompiler);
    }
}
