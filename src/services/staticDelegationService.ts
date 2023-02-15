import { DelegationAction } from "../contracts/tenantSettings";
import IDelegationService from "./IDelegationService";
import { Bag } from "@paperbits/common";


export class StaticDelegationService implements IDelegationService {

    getDelegatedSigninUrl(returnUrl: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    getDelegatedSignupUrl(returnUrl: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    getUserDelegationUrl(userId: string, action: DelegationAction, delegationParameters: Bag<string>): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public async isUserRegistrationDelegationEnabled(): Promise<boolean> {
        return false;
    }

    public async isSubscriptionDelegationEnabled(): Promise<boolean> {
        return false
    }
}