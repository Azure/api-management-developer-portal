import { HttpHeader } from "@paperbits/common/http";
import * as Utils from "@paperbits/common/utils";
import { BreakpointValues } from "@paperbits/common/styles";
import { IEventManager } from "@paperbits/common/events";
import { ThemeContract, ColorContract } from "@paperbits/styles/contracts";
import { SmapiClient } from "./smapiClient";

const stylesPath = "/contentTypes/document/contentItems/stylesheet";

export class StyleService {
    constructor(
        private readonly smapiClient: SmapiClient,
        private readonly eventManager: IEventManager
    ) { }

    private isResponsive(variation: Object): boolean {
        return Object.keys(variation).some(x => Object.keys(BreakpointValues).includes(x));
    }

    public async getStyles(): Promise<ThemeContract> {
        const stylesheet = await this.smapiClient.get<any>(stylesPath);
        const styles = stylesheet.nodes[0];

        return styles;
    }

    public async getColorByKey(colorKey: string): Promise<ColorContract> {
        const styles = await this.getStyles();
        return Utils.getObjectAt<ColorContract>(colorKey, styles);
    }

    public async addColorVariation(variationName: string): Promise<string> {
        const styles = await this.getStyles();
        
        const newColor: ColorContract = {
            key: `colors/${variationName}`,
            displayName: `New color`,
            value: "#fff"
        };

        styles["colors"][variationName] = newColor;

        this.updateStyles(styles);

        return `colors/${variationName}`;
    }

    public async addComponentVariation(componentName: string, variationName: string): Promise<string> {
        const styles = await this.getStyles();

        const newVariation: any = Utils.clone(styles["components"][componentName]["default"]);
        newVariation.key = `components/${componentName}/${variationName}`;

        styles["components"][componentName][variationName] = newVariation;

        this.updateStyles(styles);

        return `components/${componentName}/${variationName}`;
    }

    public async updateStyles(updatedStyles: ThemeContract): Promise<void> {
        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        await this.smapiClient.put<any>(stylesPath, headers, { nodes: [updatedStyles] });

        this.eventManager.dispatchEvent("onStyleChange");
    }

    public async updateStyle(style): Promise<void> {
        if (!style) {
            throw new Error("Style cannot be empty.");
        }

        if (!style.key) {
            throw new Error("Style doesn't have key.");
        }

        const styles = await this.getStyles();
        Utils.mergeDeepAt(style.key, styles, style);
        await this.updateStyles(styles);
    }

    public async getVariations<TVariation>(categoryName: string): Promise<TVariation[]> {
        const styles = await this.getStyles();

        const variations = Object.keys(styles[categoryName]).map(variationName => {
            const variationContract = styles[categoryName][variationName];
            return variationContract;
        });

        return variations;
    }

    public async getComponentVariations(componentName: string): Promise<any[]> {
        const styles = await this.getStyles();
        const componentStyles = styles.components[componentName];

        const variations = Object.keys(componentStyles).map(variationName => {
            const variationContract = componentStyles[variationName];
            return variationContract;
        });

        return variations;
    }

    public async setInstanceStyle(instanceKey: string, instanceStyles: Object): Promise<void> {
        const styles = await this.getStyles();
        Utils.mergeDeepAt(instanceKey, styles, instanceStyles);
        this.updateStyles(styles);
        this.eventManager.dispatchEvent("onStyleChange");
    }

    public async getStyleByKey(styleKey: string): Promise<any> {
        const styles = await this.getStyles();
        return Utils.getObjectAt<ColorContract>(styleKey, styles);
    }

    public async removeStyle(styleKey: string): Promise<void> {
        if (!styleKey) {
            throw new Error("Style key wasn't specified.");
        }

        const styles = await this.getStyles();
        Utils.deleteNodeAt(styleKey, styles);
        await this.updateStyles(styles);
    }
}