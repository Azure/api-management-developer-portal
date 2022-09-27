export interface IAadService {
    signInWithAad(clientId: string, authority: string, signinTenant: string, replyUrl?: string): Promise<void>;
    runAadB2CUserFlow(clientId: string, tenant: string, instance: string, userFlow: string, replyUrl?: string): Promise<void>;
    checkCallbacks(): Promise<void>;
}