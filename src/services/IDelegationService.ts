import { Bag } from "@paperbits/common";
import { DelegationAction } from "../contracts/tenantSettings";

export interface DelegationResponse {
    ssoUrl: string;
}

export interface UserDelegationResponse {
    redirectUrl: string;
}

/**
 * A service for delegation operations.
 */
export interface IDelegationService {

    /**
     * Checks if signin delegation is enabled
     * @returns true if signin delegation is enabled
     */
    isUserRegistrationDelegationEnabled(): Promise<boolean>;

    /**
     * Checks if subscription delegation is enabled
     * @returns true if subscription delegation is enabled
     */
    isSubscriptionDelegationEnabled(): Promise<boolean>

    /**
     * Get delegation sign-in url
     * @param returnUrl - url to redirect to after sign-in
     * @returns delegation sign-in url
     */
    getDelegatedSigninUrl(returnUrl: string): Promise<string>

    /**
     * Get delegation sign-up url
     * @param returnUrl - url to redirect to after sign-up
     * @returns delegation sign-up url
     */
    getDelegatedSignupUrl(returnUrl: string): Promise<string>

    /**
     * Get user specific delegation url
     * @param action - delegation action
     * @param userId - specific user
     * @param delegationParameters - delegation parameters e.g. productId, subscriptionId
     * @returns delegation url
     */
    getUserDelegationUrl(userId: string, action: DelegationAction, delegationParameters: Bag<string>): Promise<string>
}