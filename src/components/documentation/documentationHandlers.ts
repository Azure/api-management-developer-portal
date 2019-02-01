import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { DocumentationModel } from "./documentationModel";

export class DocumentationHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "documentation",
            displayName: "API documetnation",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new DocumentationModel()
        };

        return widgetOrder;
    }
}