import * as ko from "knockout";
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { TCustomWidgetConfig } from "../custom-widget";
import template from "./developmentInstructions.html";

const buildScaffoldCommand = ({displayName, technology}: TCustomWidgetConfig): string =>
    `npx @azure/api-management-custom-widgets-scaffolder --displayName="${displayName}" --technology="${technology}" --openUrl="${window.location.origin}"`

@Component({
    selector: "development-instructions",
    template: template,
})
export class DevelopmentInstructions {
    public readonly commandToScaffold: ko.Observable<string>;

    constructor() {
        this.commandToScaffold = ko.observable();
    }

    @Param()
    private config: TCustomWidgetConfig;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.commandToScaffold(buildScaffoldCommand(this.config))
    }
}
