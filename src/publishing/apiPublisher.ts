import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import { IPublisher } from "@paperbits/common/publishing";
import { IRouteHandler } from "@paperbits/common/routing";
import { IBlobStorage } from "@paperbits/common/persistence";
import { IPageService, PageContract } from "@paperbits/common/pages";
import { ISiteService, SettingsContract } from "@paperbits/common/sites";
import { LayoutViewModelBinder } from "@paperbits/core/layout/ko";
import { MetaDataSetter } from "@paperbits/common/meta";
import { MediaService, MediaContract } from "@paperbits/common/media";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { createDocument } from "@paperbits/core/ko/knockout-rendring";


export class ApiPublisher implements IPublisher {
    constructor(
        private readonly routeHandler: IRouteHandler,
        private readonly pageService: IPageService,
        private readonly siteService: ISiteService,
        private readonly outputBlobStorage: IBlobStorage,
        private readonly layoutViewModelBinder: LayoutViewModelBinder,
        private readonly mediaService: MediaService,
        private readonly settingsProvider: ISettingsProvider
    ) {
    }

    private async renderPage(page: PageContract, settings: SettingsContract, iconFile: MediaContract, imageFile: MediaContract): Promise<{ name, bytes }> {
        console.log(`Publishing page APIs...`);

        const pageTemplate = <string>await this.settingsProvider.getSetting("pageTemplate");
        const templateDocument = createDocument(pageTemplate);

        let resourceUri: string = "/apis";
        let htmlContent: string;

        const buildContentPromise = new Promise<void>(async (resolve, reject) => {
            this.routeHandler.navigateTo(resourceUri);

            const layoutViewModel = await this.layoutViewModelBinder.getLayoutViewModel();
            ko.applyBindingsToNode(templateDocument.body, { widget: layoutViewModel }, null);

            // this.setSiteSettings(templateDocument, settings, iconFile, imageFile, page, resourceUri);

            const abc = templateDocument.createElement("script");
            abc.src = "/scripts/theme.js";

            templateDocument.body.appendChild(abc);

            setTimeout(() => {
                htmlContent = "<!DOCTYPE html>" + templateDocument.documentElement.outerHTML;
                resolve();
            }, 10);
        });

        await buildContentPromise;

        const contentBytes = Utils.stringToUnit8Array(htmlContent);

        if (!resourceUri || resourceUri === "/") {
            resourceUri = "/index.html";
        }
        else {
            // if filename has no extension we publish it to a dedicated folder with index.html
            if (!resourceUri.substr((~-resourceUri.lastIndexOf(".") >>> 0) + 2)) {
                resourceUri = `/${resourceUri}/index.html`;
            }
        }

        return { name: resourceUri, bytes: contentBytes };
    }

    public async publish(): Promise<void> {
        const pageRenderResult = await this.renderPage(null, null, null, null);
        await this.outputBlobStorage.uploadBlob(pageRenderResult.name, pageRenderResult.bytes);
    }

    public setSiteSettings(templateDocument: Document, settings: SettingsContract, iconFile: MediaContract, imageFile: MediaContract, page: PageContract, pageUri: string): void {
        if (settings && page) {
            if (iconFile && iconFile.downloadUrl) {
                MetaDataSetter.setFavIcon(iconFile.downloadUrl);
            }

            const ldSettings: any = {
                "@context": "http://www.schema.org",
                "@type": "product"
            };

            const ogMeta = {};
            const twitterMeta = {
                "twitter:card": "summary"
            };

            let documentTitle = settings.site.title;

            if (page.title && pageUri !== "/") {
                documentTitle = `${page.title} | ${settings.site.title}`;
            }

            templateDocument.title = documentTitle;

            if (templateDocument.title) {
                ogMeta["og:title"] = templateDocument.title;
                twitterMeta["twitter:title"] = templateDocument.title;
                ldSettings.name = templateDocument.title;
            }

            if (page.ogType) {
                ogMeta["og:type"] = page.ogType;
            }

            if (pageUri && settings.site.ogUrl) {
                ogMeta["og:url"] = `${settings.site.ogUrl}${pageUri}`;
                twitterMeta["twitter:url"] = `${settings.site.ogUrl}${pageUri}`;
            }

            if (imageFile && imageFile.downloadUrl) {
                ldSettings.image = imageFile.downloadUrl;
                ogMeta["og:image"] = imageFile.downloadUrl;
                twitterMeta["twitter:image"] = imageFile.downloadUrl;
            }

            if (settings.site.description) {
                const description = page.description || settings.site.description;
                ogMeta["og:description"] = description;
                twitterMeta["twitter:description"] = description;
                MetaDataSetter.setDescription(description);
                ldSettings.description = description;
            }

            if (settings.site.ogSiteName) {
                ogMeta["og:site_name"] = settings.site.ogSiteName;
                ldSettings.brand = settings.site.ogSiteName;
            }

            if (settings.site.keywords) {
                MetaDataSetter.setKeywords(page.keywords);
            }

            if (settings.site.author) {
                MetaDataSetter.setAuthor(settings.site.author);
            }

            MetaDataSetter.setMetaObject(ogMeta, "property");
            MetaDataSetter.setMetaObject(twitterMeta, "name");
            MetaDataSetter.setScriptElement(ldSettings, "application/ld+json");
        }
    }
}