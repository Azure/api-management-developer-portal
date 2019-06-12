import * as ko from "knockout";
import template from "./detailsOfApiEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { DetailsOfApiModel } from "../detailsOfApiModel";

@Component({
    selector: "details-of-api-editor",
    template: template,
    injectable: "detailsOfApiEditor"
})
export class DetailsOfApiEditor {
    constructor() { }

    @Param()
    public model: DetailsOfApiModel;

    @Event()
    public onChange: (model: DetailsOfApiModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        // TODO: Implement
    }
}