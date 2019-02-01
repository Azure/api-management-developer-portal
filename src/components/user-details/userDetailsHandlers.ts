import { IWidgetOrder } from '@paperbits/common/editing';
import { IWidgetHandler } from '@paperbits/common/editing';
import { UserDetailsModel } from './userDetailsModel';

export class UserDetailsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "userDetails",
            displayName: "User profile",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new UserDetailsModel()
        }

        return widgetOrder;
    }
}