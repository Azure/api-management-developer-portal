import * as ko from "knockout";
import template from "./historyOfApiEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { HistoryOfApiModel } from "../historyOfApiModel";

@Component({
    selector: "history-of-api-editor",
    template: template,
    injectable: "historyOfApiEditor"
})
export class HistoryOfApiEditor {
    constructor() { }

    @Param()
    public model: HistoryOfApiModel;

    @Event()
    public onChange: (model: HistoryOfApiModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        // TODO: Implement
    }
}