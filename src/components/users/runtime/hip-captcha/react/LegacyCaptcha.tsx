import * as React from "react";
import { Spinner } from "@fluentui/react-components";
import { BackendService } from "../../../../../services/backendService";
import { CaptchaData } from "../../../../../models/captchaData";

declare let WLSPHIP0;
declare let fillHipData;

export type TOnInitComplete = (
    captchaValidate: () => "valid" | null,
    refreshCaptcha: () => Promise<void>,
    captchaData: CaptchaData
) => void;

export type TCaptchaProps = {
    backendService: BackendService
    onInitComplete?: TOnInitComplete
};

type LegacyCaptchaState = {
    encryptedFlowId: string
    working: boolean
};

export class LegacyCaptcha extends React.Component<TCaptchaProps, LegacyCaptchaState> {
    constructor(props: TCaptchaProps) {
        super(props);

        this.state = {
            encryptedFlowId: undefined,
            working: true,
        };
    }

    async componentDidMount() {
        try {
            const hipObjScriptElement = document.createElement("script");
            hipObjScriptElement.type = "text/javascript";
            hipObjScriptElement.src = "/scripts/js/HipObject.js";

            this.onLoad = this.onLoad.bind(this);
            hipObjScriptElement.onload = this.onLoad;
            document.body.appendChild(hipObjScriptElement);
        } finally {
            this.setState({ working: false });
        }

        if (this.props.onInitComplete) {
            let captchaData: CaptchaData;

            const setValidation = () => {
                let result: "valid" | null = null;

                WLSPHIP0.verify((solution, token) => {
                    WLSPHIP0.clientValidation();

                    if (WLSPHIP0.error !== 0) {
                        result = null; // is not valid
                        return;
                    } else {
                        const flowIdElement = document.getElementById("FlowId") as HTMLInputElement;
                        captchaData = {
                            solution: {
                                solution, token, type: WLSPHIP0.type, flowId: flowIdElement.value
                            }
                        };
                        result = "valid";
                        return;
                    }
                }, "");

                return result;
            }

            this.props.onInitComplete(setValidation, this.refreshCaptcha.bind(this), captchaData);
        }
    }

    private async onLoad(): Promise<void> {
        const params = await this.props.backendService.getCaptchaParams();
        this.setState({ encryptedFlowId: params.EncryptedFlowId });

        const scriptElement = document.createElement("script");
        scriptElement.type = "text/javascript";
        scriptElement.src = params.HipUrl;

        const captchaElement = document.getElementById("captcha");
        if (captchaElement) {
            const form = captchaElement.closest("form");
            if (form) form.submit = () => WLSPHIP0.verify(fillHipData, "");
            const ispHIPHIP = captchaElement.querySelector("#ispHIPHIP") as HTMLElement;

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

    public async refreshCaptcha(): Promise<void> {
        this.setState({ working: true });
        try {
            WLSPHIP0.reloadHIP();
        } finally {
            this.setState({ working: false });
        }
    }

    render() {
        if (this.state.working) return <Spinner />;

        return (
            <div id="captcha" className="captcha">
                <div className="form-group">
                    <div id="ispHIPHIP"></div>
                    <div id="ispHIPScript" style={{display: "inline"}}></div>
                    <input type="hidden" id="Solution" name="Solution"/>
                    <input type="hidden" id="Token" name="Token"/>
                    <input type="hidden" id="Type" name="Type"/>
                    <input type="hidden" id="FlowId" name="FlowId" value={this.state.encryptedFlowId} />
                </div>
            </div>
        );
    }
}
