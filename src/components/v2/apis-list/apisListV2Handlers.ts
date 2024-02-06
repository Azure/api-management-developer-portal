import { IWidgetHandler } from "@paperbits/common/editing";
import { ApisListV2Model } from "./apisListV2Model";

export class ApisListV2Handlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ApisListV2Model> {
        return new ApisListV2Model();
    }
}
