/**
 * Cotract of Reset password request
 */
export interface ResetRequest {
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