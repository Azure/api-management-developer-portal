import "setimmediate";
import { createDocument } from "@paperbits/core/ko/knockout-rendring";
import { IInjector } from "@paperbits/common/injection";
import { SitePublisher } from "./sitePublisher";
import { PagePublisher } from "./pagePublisher";
import { BlogPublisher } from "./blogPublisher";
import { MediaPublisher } from "./mediaPublisher";
import { AssetPublisher } from "./assetPublisher";

export class PublishingNodeModule {
    public register(injector: IInjector): void {
        createDocument();
        
        injector.bindSingleton("sitePublisher", SitePublisher);
        injector.bindSingleton("assetPublisher", AssetPublisher);
        injector.bindSingleton("pagePublisher", PagePublisher);
        injector.bindSingleton("blogPublisher", BlogPublisher);
        injector.bindSingleton("mediaPublisher", MediaPublisher);

        const stylePublisher = injector.resolve("stylePublisher");
        const pagePublisher = injector.resolve("pagePublisher");
        const mediaPublisher = injector.resolve("mediaPublisher");
        const assetPublisher = injector.resolve("assetPublisher");
        const blogPublisher = injector.resolve("blogPublisher");

        injector.bindInstance("publishers", [
            stylePublisher,
            assetPublisher,
            mediaPublisher,
            blogPublisher,
            pagePublisher
        ]);
    }
}