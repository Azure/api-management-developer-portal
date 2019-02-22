import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import template from "../themes/apim/assets/page.html";
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


export class PagePublisher implements IPublisher {
    constructor(
        private readonly routeHandler: IRouteHandler,
        private readonly pageService: IPageService,
        private readonly siteService: ISiteService,
        private readonly outputBlobStorage: IBlobStorage,
        private readonly layoutViewModelBinder: LayoutViewModelBinder,
        private readonly mediaService: MediaService,
        private readonly settingsProvider: ISettingsProvider
    ) {
        this.publish = this.publish.bind(this);
        this.renderPage = this.renderPage.bind(this);
        this.setSiteSettings = this.setSiteSettings.bind(this);
    }

    private async renderPage(page: PageContract, settings: SettingsContract, iconMedia: MediaContract, imageMedia: MediaContract): Promise<{ permalink, bytes }> {
        console.log(`Publishing page ${page.title}...`);
        const templateDocument = createDocument(template);

        let permalink = page.permalink;
        let htmlContent: string;

        const buildContentPromise = new Promise<void>(async (resolve, reject) => {
            this.routeHandler.navigateTo(page.permalink);

            const layoutViewModel = await this.layoutViewModelBinder.getLayoutViewModel();
            ko.applyBindingsToNode(templateDocument.body, { widget: layoutViewModel }, null);

            if (page.ogImageSourceKey) {
                imageMedia = await this.mediaService.getMediaByKey(page.ogImageSourceKey);
            }

            this.setSiteSettings(templateDocument, settings, iconMedia, imageMedia, page, page.permalink);

            setTimeout(() => {
                htmlContent = "<!DOCTYPE html>" + templateDocument.documentElement.outerHTML;
                resolve();
            }, 500);
        });

        await buildContentPromise;

        const contentBytes = Utils.stringToUnit8Array(htmlContent);

        if (!permalink || permalink === "/") {
            permalink = "/index.html";
        }
        else {
            // if filename has no extension we publish it to a dedicated folder with index.html
            if (!permalink.substr((~-permalink.lastIndexOf(".") >>> 0) + 2)) {
                permalink = `/${permalink}/index.html`;
            }
        }

        return { permalink: permalink, bytes: contentBytes };
    }

    public async publish(): Promise<void> {
        const pages = await this.pageService.search("");
        const results = [];
        const settings = await this.siteService.getSiteSettings();

        let iconFile;

        if (settings && settings.site.faviconSourceKey) {
            iconFile = await this.mediaService.getMediaByKey(settings.site.faviconSourceKey);
        }

        let imageFile;

        if (settings && settings.site.ogImageSourceKey) {
            imageFile = await this.mediaService.getMediaByKey(settings.site.ogImageSourceKey);
        }

        // const renderAndUpload = async (page): Promise<void> => {
        //     const pageRenderResult = await this.renderPage(page, settings, iconFile, imageFile);
        //     await this.outputBlobStorage.uploadBlob(pageRenderResult.name, pageRenderResult.bytes);
        // };

        // for (const page of pages) {
        //     results.push(renderAndUpload(page));
        // }

        for (const page of pages) {
            const pageRenderResult = await this.renderPage(page, settings, iconFile, imageFile);
            results.push(this.outputBlobStorage.uploadBlob(pageRenderResult.permalink, pageRenderResult.bytes, "text/html"));
        }

        await Promise.all(results);
    }

    public setSiteSettings(templateDocument: Document, settings: SettingsContract, iconFile: MediaContract, imageFile: MediaContract, page: PageContract, permalink: string): void {
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

            if (page.title && permalink !== "/") {
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

            if (permalink && settings.site.ogUrl) {
                ogMeta["og:url"] = `${settings.site.ogUrl}${permalink}`;
                twitterMeta["twitter:url"] = `${settings.site.ogUrl}${permalink}`;
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