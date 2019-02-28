import * as ko from "knockout";
import template from "./documentation.html";
import { Component, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { NavigationItemModel } from "@paperbits/common/navigation";
import { Operation } from "../../../models/operation";
import { Api } from "../../../models/api";

@RuntimeComponent({ selector: "api-documentation" })
@Component({
    selector: "api-documentation",
    template: template,
    injectable: "apiDocumentation"
})
export class Documentation {
    public navigation: ko.Observable<NavigationItemModel>;
    public selectedApi: ko.Observable<Api>;
    public selectedOperation: ko.Observable<Operation>;

    constructor() {
        this.selectedApi = ko.observable();
        this.selectedOperation = ko.observable();
    }

    public selectApi(api: Api): void {
        this.selectedApi(api);
    }

    public openConsole(operation: Operation): void {
        this.selectedOperation(operation);
    }

    public closeConsole(): void {
        this.selectedOperation(null);
    }
}
