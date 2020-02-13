import * as ko from "knockout";
import template from "./file-input.html";
import { Component, Event } from "@paperbits/common/ko/decorators";


@Component({
    selector: "file-input",
    template: template
})
export class FileInput {
    private readonly input: HTMLInputElement;
    public selectedFileInfo: ko.Observable<string>;

    @Event()
    public onSelect: (file: File) => void;

    constructor() {
        this.selectedFileInfo = ko.observable<string>();
        this.input = document.createElement("input");
        this.input.type = "file";
        this.input.onchange = this.onChange.bind(this);
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === 13) {
            event.preventDefault();
            this.input.click();
        }
    }

    public onClick(): void {
        this.input.value = "";
        this.input.click();
    }

    public onChange(event: any): void {
        if (event.target.files.length > 0) {
            const file: File = event.target.files[0];
            this.selectedFileInfo(`${file.name} (${Math.floor(file.size / 1024)} Kb)`);

            this.onSelect(file);
        }
        else {
            this.onSelect(null);
        }
    }
}