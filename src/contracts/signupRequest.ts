/**
 * Cotract of user sign up request
 */
export interface SignupRequest {
    solution: string,
    token: string,
    type: string,
    flowId: string,
    signupData: {
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
}