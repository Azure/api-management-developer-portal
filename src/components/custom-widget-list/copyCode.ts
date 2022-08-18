import { Component, Param } from "@paperbits/common/ko/decorators";
import template from "./copyCode.html";

@Component({
    selector: "copy-code",
    template: template,
})
export class CopyCode {
    @Param()
    public code: string;
}
