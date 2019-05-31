export interface SignupRequest {
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