import { CaptchaChallengeRequest } from "./captchaParams";

/**
 * Cotract of Reset password request
 */
export interface ResetRequest {
    challenge: CaptchaChallengeRequest;
    solution: string;
    token: string;
    type: string;
    flowId: string;
    email: string;
}

/**
 * Cotract of user change password 
 */
export interface ChangePasswordRequest {
    challenge: CaptchaChallengeRequest;
    solution: string;
    token: string;
    type: string;
    flowId: string;
    userId: string;
    newPassword: string;
}

/**
 * Cotract of user reset password
 */
export interface ResetPassword {
    userid: string;
    ticketid: string;
    ticket: string;
    password: string;
}