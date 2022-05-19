import { CaptchaChallengeRequest } from "../contracts/captchaParams";

export class CaptchaData {
    challenge?: CaptchaChallengeRequest;
    solution?: {
        solution: string;
        flowId: string;
        token: string;
        type: string;
    }
}