﻿import { IWidgetHandler } from "@paperbits/common/editing";
import { ChangePasswordModel } from "./changePasswordModel";

export class ChangePasswordHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ChangePasswordModel> {
        return new ChangePasswordModel()
    }
}