import { IObjectStorage } from "@paperbits/common/persistence";
import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { CachedObjectStorage } from "./cachedObjectStorage";


export class PublishingCacheModule implements IInjectorModule {
    public register(injector: IInjector): void {
        const underlyingObjectStorage = injector.resolve<IObjectStorage>("objectStorage");

        injector.bindSingletonFactory<IObjectStorage>("objectStorage", (ctx: IInjector) => {
            return new CachedObjectStorage(underlyingObjectStorage);
        });
    }
}