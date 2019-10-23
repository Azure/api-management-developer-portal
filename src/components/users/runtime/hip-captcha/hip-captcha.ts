import * as ko from "knockout";
import { BackendService } from "../../../../services/backendService";
import { Component } from "@paperbits/common/ko/decorators";
import template from "./hip-captcha.html";

declare var WLSPHIP0;
declare var fillHipData;

@Component({
    selector: "hip-captcha",
    template: template,
    injectable: "hipCaptcha"
})
export class HipCaptcha {
    public encryptedFlowId: ko.Observable<string>;

    constructor(private readonly backendService: BackendService) {
        this.encryptedFlowId = ko.observable();
        const hipObjScriptElement = document.createElement("script");
        hipObjScriptElement.src = "/scripts/js/HipObject.js";

        this.onLoad = this.onLoad.bind(this);
        hipObjScriptElement.onload = this.onLoad;
        document.body.appendChild(hipObjScriptElement);
    }

    private async onLoad(): Promise<void> {
        const params = await this.backendService.getCaptchaParams();
        this.encryptedFlowId(params.EncryptedFlowId);

        const scriptElement = document.createElement("script");
        scriptElement.src = params.HipUrl;

        const captchaElement = document.getElementById("captcha");
        if (captchaElement) {
            const form = captchaElement.closest("form");
            form.submit = () => WLSPHIP0.verify(fillHipData, '');
            const ispHIPHIP = <HTMLElement>captchaElement.querySelector("#ispHIPHIP");

            WLSPHIP0.error = "0";
            WLSPHIP0.left = 0;
            WLSPHIP0.inputWidth = ispHIPHIP.offsetWidth;
            WLSPHIP0.cssSet = {
                "cssCdHIPInput": "form-control captcha-input",
                "cssCdHIPMenu": "",
                "cssCdHIPLink": "",
                "cssCdHIPError": "",
                "cssCdHIPErrorImg": ""
            };
            WLSPHIP0.postLoad = () => {
                const captchaInput = ispHIPHIP.querySelector('input[type=text]');
                captchaInput.removeAttribute("style");
                captchaInput.setAttribute("placeholder", "Enter the captcha here");
            }

            const ispHipContainer = document.getElementById("ispHIPScript");
            ispHipContainer.appendChild(scriptElement);
        }
    }
}