import { CaptchaChallengeRequest } from "../contracts/captchaParams";

export class CaptchaData {
    public challenge?: CaptchaChallengeRequest;
    public solution?: {
        solution: string;
        flowId: string;
        token: string;
        type: string;
    };
}