import * as ko from "knockout";
import template from "./listOfApisEditor.html";
import { StyleService } from "@paperbits/styles";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { ListOfApisModel } from "../listOfApisModel";

@Component({
    selector: "list-of-apis-editor",
    template: template,
    injectable: "listOfApisEditor"
})
export class ListOfApisEditor {
    constructor(private readonly styleService: StyleService) { }

    @Param()
    public model: ListOfApisModel;

    @Event()
    public onChange: (model: ListOfApisModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        // TODO: Implement
    }

    private applyChanges(): void {
        // TODO: Implement
        this.onChange(this.model);
    }
}