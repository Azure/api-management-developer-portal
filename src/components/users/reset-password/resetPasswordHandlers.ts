﻿import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ResetPasswordModel } from "./resetPasswordModel";

export class ResetPasswordHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "reset-password",
            category: "User",
            displayName: "Password: reset form",
            iconClass: "paperbits-cheque-3",
            requires: ["html"],
            createModel: async () => new ResetPasswordModel()
        };

        return widgetOrder;
    }
}