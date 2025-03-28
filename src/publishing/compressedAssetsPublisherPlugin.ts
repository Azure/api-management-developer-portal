import { HtmlPagePublisherPlugin } from "@paperbits/common/publishing/htmlPagePublisherPlugin";
import { HtmlPage } from "@paperbits/common/publishing/htmlPage";
import { Logger } from "@paperbits/common/logging";
import { WellKnownEventTypes } from "../logging/wellKnownEventTypes";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { USE_COMPRESSED_ASSETS } from "../constants";
import { Utils } from "../utils";

export class CompressedAssetsPublisherPlugin implements HtmlPagePublisherPlugin {
    constructor(
        private readonly compressedAssetsConfiguration: CompressedAssetsConfiguration,
        private readonly settingsProvider: ISettingsProvider,
        private readonly logger: Logger
    ) { }

    public async apply(document: Document, page?: HtmlPage): Promise<void> {
        const featureIsEnabled = await this.getFeatureFlagIsEnabled()
        if (!featureIsEnabled) {
            return;
        }

        for (const path of this.compressedAssetsConfiguration.pathsPrefixes) {
            if (this.compressedAssetsConfiguration.css) {
                const linkTags = document.querySelectorAll<HTMLLinkElement>(`link[href^='/${path}']`);
                linkTags.forEach(link => {
                    this.replaceToCompressed(link, ["css"]);
                });
            }

            if (this.compressedAssetsConfiguration.js) {
                const scriptTags = document.querySelectorAll<HTMLScriptElement>(`script[src^='/${path}']`);
                scriptTags.forEach(script => {
                    this.replaceToCompressed(script, ["js"]);
                });
            }
        }
    }

    private replaceToCompressed(element: HTMLScriptElement |  HTMLLinkElement, supportedExtensions: string[]): void {
        const originalSrc = this.getSrcElement(element);
        const originalExtension = originalSrc.split('.').pop();
        if (supportedExtensions.includes(originalExtension)) {
            const newValue = this.setSrcElement(element, `${originalSrc}.${this.compressedExtension()}`);
            this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Path replaced to compressed asset: ${newValue}` });
        }
    }

    private getSrcElement(element: HTMLScriptElement | HTMLLinkElement): string {
        if (element["src"]) {
            return element["src"];
        }
        if (element["href"]) {
            return element["href"];
        }
    }

    private setSrcElement(element: HTMLScriptElement | HTMLLinkElement, value: string): string {
        if (element["src"]) {
            element["src"] = value;
            return element["src"];
        }
        if (element["href"]) {
            element["href"] = value;
            return element["href"];
        }
    }

    private compressedExtension(): string {
        return this.compressedAssetsConfiguration.compressedExtension.startsWith(".")
            ? this.compressedAssetsConfiguration.compressedExtension.slice(1)
            : this.compressedAssetsConfiguration.compressedExtension;
    }

    private getFeatureFlagIsEnabled(): Promise<boolean> {
        return Utils.checkIsFeatureEnabled(USE_COMPRESSED_ASSETS, this.settingsProvider, this.logger);
    }
}

export interface CompressedAssetsConfiguration {
    readonly js: boolean;
    readonly css: boolean;
    readonly compressedExtension: string;
    readonly pathsPrefixes: string[];
}