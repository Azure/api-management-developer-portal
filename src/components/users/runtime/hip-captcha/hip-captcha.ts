import * as ko from "knockout";
import * as Constants from "../../../../constants";
import { BackendService } from "../../../../services/backendService";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import template from "./hip-captcha.html";
import { CaptchaChallenge } from "../../../../contracts/captchaParams";
import { CaptchaData } from "../../../../models/captchaData";

declare let WLSPHIP0;
declare let fillHipData;

@Component({
    selector: "hip-captcha",
    template: template
})
export class HipCaptcha {
    public readonly encryptedFlowId: ko.Observable<string>;

    public readonly isNewCaptcha: ko.Observable<boolean>;
    public readonly isLegacyCaptcha: ko.Observable<boolean>;
    public readonly captchaChallenge: ko.Observable<string>;
    public readonly captchaValue: ko.Observable<string>;
    public readonly captchaType: ko.Observable<string>;
    public readonly working: ko.Observable<boolean>;
    public challengeData: CaptchaChallenge;

    private audioElement: HTMLAudioElement;

    constructor(private readonly backendService: BackendService) {
        this.encryptedFlowId = ko.observable();
        this.captchaChallenge = ko.observable();
        this.captchaType = ko.observable();
        this.isNewCaptcha = ko.observable(false);
        this.isLegacyCaptcha = ko.observable(false);
        this.working = ko.observable(true);
        this.captchaData = ko.observable();
        this.captchaValue = ko.observable();
        this.setValidation = this.setValidation.bind(this);
        this.refreshCaptcha = this.refreshCaptcha.bind(this);
    }

    @Param()
    public readonly captchaData: ko.Observable<CaptchaData>;

    @Event()
    public onInitComplete: (captchaValidate: (captchaValidator: ko.Observable<string>) => void, refreshCaptcha: () => Promise<void>) => void;

    /**
     * Initializes component right after creation.
     */
    @OnMounted()
    public async initialize(): Promise<void> {
        try {
            const settings = await this.backendService.getCaptchaSettings();
            this.isNewCaptcha(settings && settings.captchaEnabled);
            this.isLegacyCaptcha(settings && settings.legacyCaptchaEnabled);

            // Do not load Captcha component if captcha endpoints are not available
            if (!this.isNewCaptcha() && !this.isLegacyCaptcha()) {
                this.working(false);
                return;
            }
        }
        catch {
            // do nothing
        }

        try {
            if (this.isNewCaptcha()) {
                this.captchaValue
                    .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
                    .subscribe(this.updateChallengeInput);

                await this.getCaptchaChallenge("visual"); // audio
            } else {
                const hipObjScriptElement = document.createElement("script");
                hipObjScriptElement.type = "text/javascript";
                hipObjScriptElement.src = "/scripts/js/HipObject.js";

                this.onLoad = this.onLoad.bind(this);
                hipObjScriptElement.onload = this.onLoad;
                document.body.appendChild(hipObjScriptElement);
            }
        }
        finally {
            this.working(false);
        }

        if (this.onInitComplete) {
            this.onInitComplete(this.setValidation, this.refreshCaptcha);
        }
    }

    private updateChallengeInput(solution: string): void {
        const challengeRequest = this.captchaData();
        if (challengeRequest) {
            challengeRequest.challenge.testCaptchaRequest.inputSolution = solution;
        }
    }

    private async getCaptchaChallenge(challengeType: string): Promise<void> {
        this.working(true);
        this.captchaType(challengeType);
        try {
            this.challengeData = await this.backendService.getCaptchaChallenge(challengeType);
            if (this.challengeData) {
                this.captchaData({
                    challenge: {
                        testCaptchaRequest: {
                            challengeId: this.challengeData.ChallengeId,
                            inputSolution: undefined
                        },
                        azureRegion: this.challengeData.AzureRegion,
                        challengeType: this.challengeData.ChallengeType
                    },
                    solution: undefined
                });
                if (this.challengeData.ChallengeType === "visual") {
                    this.captchaChallenge(`data:image/png;base64,${this.challengeData.ChallengeString}`);
                    return;
                }
                if (this.challengeData.ChallengeType === "audio") {
                    this.audioElement = new Audio(`data:audio/mp3;base64,${this.challengeData.ChallengeString}`);
                }
            } else {
                this.captchaChallenge("");
            }
        } finally {
            this.working(false);
        }
    }

    public playChallenge(): void {
        if (this.audioElement) {
            this.audioElement.currentTime = 0;
            this.audioElement.play();
        }
    }

    public async refreshChallenge(): Promise<void> {
        const challengeType = this.captchaType();
        if (challengeType === "audio" && this.audioElement) {
            this.audioElement.pause();
        }
        this.captchaValue(null);
        await this.getCaptchaChallenge(challengeType);
    }

    public async changeChallengeType(): Promise<void> {
        const challengeType = this.captchaType() === "visual" ? "audio" : "visual";
        if (challengeType === "visual" && this.audioElement) {
            this.audioElement.pause();
        }
        this.captchaType(challengeType);
        await this.getCaptchaChallenge(challengeType);
    }

    private async onLoad(): Promise<void> {
        const params = await this.backendService.getCaptchaParams();
        this.encryptedFlowId(params.EncryptedFlowId);

        const scriptElement = document.createElement("script");
        scriptElement.type = "text/javascript";
        scriptElement.src = params.HipUrl;

        const captchaElement = document.getElementById("captcha");
        if (captchaElement) {
            const form = captchaElement.closest("form");
            form.submit = () => WLSPHIP0.verify(fillHipData, "");
            const ispHIPHIP = <HTMLElement>captchaElement.querySelector("#ispHIPHIP");

            WLSPHIP0.error = "0";
            WLSPHIP0.left = 0;
            WLSPHIP0.inputWidth = ispHIPHIP.offsetWidth;
            WLSPHIP0.cssSet = {
                cssCdHIPInput: "form-control captcha-input",
                cssCdHIPMenu: "",
                cssCdHIPLink: "",
                cssCdHIPError: "",
                cssCdHIPErrorImg: ""
            };
            WLSPHIP0.postLoad = () => {
                const captchaInput = ispHIPHIP.querySelector("input[type=text]");
                captchaInput.removeAttribute("style");
                captchaInput.setAttribute("placeholder", "Enter the captcha here");
            };

            const ispHipContainer = document.getElementById("ispHIPScript");
            ispHipContainer.appendChild(scriptElement);
        }
    }

    public setValidation(captchaValidator: ko.Observable<string>): void {
        const data = this.captchaData();
        if (this.isNewCaptcha()) {
            if (data.challenge?.testCaptchaRequest.inputSolution) {
                captchaValidator("valid");
            } else {
                captchaValidator(null); // is not valid
            }
        } else {
            WLSPHIP0.verify((solution, token, param) => {
                WLSPHIP0.clientValidation();

                if (WLSPHIP0.error !== 0) {
                    captchaValidator(null); // is not valid
                    return;
                }
                else {
                    const flowIdElement = <HTMLInputElement>document.getElementById("FlowId");
                    this.captchaData({
                        solution: {
                            solution, token, type: WLSPHIP0.type, flowId: flowIdElement.value
                        }
                    });
                    captchaValidator("valid");
                    return;
                }
            }, "");
        }
    }

    public async refreshCaptcha(): Promise<void> {
        this.working(true);
        try {
            if (this.isNewCaptcha()) {
                await this.refreshChallenge();
            } else {
                WLSPHIP0.reloadHIP();
            }
        } finally {
            this.working(false);
        }
    }
}