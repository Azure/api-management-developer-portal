import { WellKnownEventTypes } from "../wellKnownEventTypes";

export interface IDefaultLogEventTypeProvider {
    getLogEventType(): string;
}

export class PublishingDefaultLogEventTypeProvider implements IDefaultLogEventTypeProvider {
    public getLogEventType(): string {
        return WellKnownEventTypes.Publishing;
    }
}