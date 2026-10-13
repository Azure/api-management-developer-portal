import { CaptchaChallengeRequest } from "./captchaParams";

/**
 * Cotract of user sign up request
 */
export interface SignupRequest {
    challenge: CaptchaChallengeRequest;
    powChallenge: PowCaptchaPayload;
    solution: string;
    token: string;
    type: string;
    flowId: string;
    signupData: MapiSignupRequest;
}

export interface PowCaptchaPayload {
    solution: string;
}

export interface MapiSignupRequest {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmation: string;
    state?: string;
    note?: string;
    identities?: { id: string; name: string }[];
    appType: string;
}