
import { DefaultStyleCompiler, StyleService } from "@paperbits/styles";
import {
    Style,
    StyleSheet,
    StyleManager,
    StyleModel,
    LocalStyles,
    PluginBag,
} from "@paperbits/common/styles";
import * as Utils from "@paperbits/common/utils";
import * as Objects from "@paperbits/common/objects";
import { Logger } from "@paperbits/common/logging";
import { IPermalinkResolver } from "@paperbits/common/permalinks";

export class ApimDefaultStyleCompiler extends DefaultStyleCompiler {

    constructor(
        styleService: StyleService,
        permalinkResolver: IPermalinkResolver,
        private readonly logger: Logger
    ) {
       super(styleService, permalinkResolver);
    }

    public async getStyleModelAsync(localStyles: LocalStyles, styleManager?: StyleManager): Promise<StyleModel> {
        if (!localStyles) {
            throw new Error(`Parameter "localStyles" not specified.`);
        }
        localStyles = Objects.clone(localStyles); // To drop any object references
        Objects.cleanupObject(localStyles, { removeNulls: true });

        const classNames = [];
        let variationStyle: Style;
        let styleSheetKey: string;

        for (const category of Object.keys(localStyles)) {
            const categoryConfig = localStyles[category];

            if (!categoryConfig) {
                continue;
            }

            if (category === "instance") {
                const pluginBag = <PluginBag>categoryConfig;
                const instanceClassName = pluginBag.key || Utils.randomClassName();
                pluginBag.key = instanceClassName;
                styleSheetKey = pluginBag.key;

                variationStyle = await this.getVariationStyle(pluginBag, instanceClassName);

                const instanceClassNames = this.getVariationClassNames(pluginBag, instanceClassName);
                classNames.push(...instanceClassNames);
            }
            else {

                // For the old contentType schema, categoryConfig could be an object that was breaking the publishing
                // process. This is going to ignore the old schema
                if (typeof categoryConfig !== "string") {
                    this.logger.trackEvent("IncorrectStyleSchema", { message: "Not supported schema during compiling styles" });
                    continue;
                }

                const styleKey = <string>categoryConfig;
                const className = await this.getClassNameByStyleKeyAsync(styleKey);

                if (className) {
                    classNames.push(className);
                }
            }
        }

        const localStyleSheet = new StyleSheet(styleSheetKey);

        if (variationStyle) {
            localStyleSheet.styles.push(variationStyle);
        }

        const styleModel = new StyleModel();
        styleModel.classNames = classNames.join(" ");
        styleModel.styleSheet = localStyleSheet;
        styleModel.styleManager = styleManager;

        return styleModel;
    }
}
