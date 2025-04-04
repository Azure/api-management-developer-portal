import { StyleSheet, StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { CustomHtmlModel } from "../customHtmlModel";
import { CustomHtmlViewModel } from "./customHtmlViewModel";
import { IBlobStorage } from "@paperbits/common/persistence/IBlobStorage";
import * as Utils from "@paperbits/common/utils";
import { JssCompiler } from "@paperbits/styles/jssCompiler";
import { Logger } from "@paperbits/common/logging/logger";
import { WellKnownEventTypes } from "../../../logging/wellKnownEventTypes";

export class CustomHtmlPublishViewModelBinder implements ViewModelBinder<CustomHtmlModel, CustomHtmlViewModel>  {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly blobStorage: IBlobStorage,
        private readonly outputBlobStorage: IBlobStorage,
        private readonly logger: Logger
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: CustomHtmlViewModel): void {
        componentInstance.styles(state.styles);
        componentInstance.htmlCode(state.htmlCode);
        componentInstance.src(state.src);
    }

    public async modelToState(model: CustomHtmlModel, state: WidgetState): Promise<void> {
        let htmlInheritedStyles: string = "";
        let htmlInheritedCustomFonts: string = "";

        if (model.inheritStyling) {
            htmlInheritedStyles = this.getInheritedStyles();
            if (model.addCustomFonts) {
                htmlInheritedCustomFonts = await this.getCustomFonts();
            }
        }

        let htmlCode = model.htmlCode?.replace("<head>", `<head>${htmlInheritedStyles}`);
        if (htmlInheritedCustomFonts?.length > 0) {
            htmlCode = htmlCode.replace("<style>", `<style>${htmlInheritedCustomFonts}`);
        }

        if (htmlCode?.length > 0) {
            const content = Utils.stringToUnit8Array(htmlCode);
            const src = `/content/html_widgets/${Utils.identifier()}.html`;
            this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `CustomHtmlPublish: Uploading ${src} Size: ${content.length} Byte` });
            await this.outputBlobStorage.uploadBlob(src, content);
            state.src = src;
        }

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }

    private getInheritedStyles(): string {
        return '<link href="/styles/theme.css" rel="stylesheet" type="text/css"><link href="/styles/styles.css" rel="stylesheet" type="text/css">';
    }

    private async getCustomFonts(): Promise<string> {
        const globalStyleSheet = await this.styleCompiler.getStyleSheet();
        const styleSheet = new StyleSheet();
        if (globalStyleSheet.fontFaces.length > 0) {
            for (let i = 0; i < globalStyleSheet.fontFaces.length; i++) {
                const fontFace = globalStyleSheet.fontFaces[i];
                if (fontFace.source?.startsWith("/fonts/")) {
                    const fontData = await this.blobStorage.downloadBlob(fontFace.source);
                    this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `CustomHtmlPublish: Adding ${fontFace.source} font as base64` });
                    const fontDataString = Buffer.from(fontData).toString("base64");
                    fontFace.source = `data:font/truetype;charset=utf-8;base64,${fontDataString}`
                    styleSheet.fontFaces.push(fontFace);
                }
            }
        }
        if (styleSheet.fontFaces.length > 0) {
            const compiler = new JssCompiler();
            return compiler.compile(styleSheet);
        }
        return "";
    }
}