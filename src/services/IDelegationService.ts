import { DelegationAction } from "../contracts/tenantSettings";

/**
 * A service for delegation operations.
 */
export default interface IDelegationService {

    /**
     * Checks if signin delegation is enabled
     * @returns true if signin delegation is enabled
     */
    isSigninDelegationEnabled(): Promise<boolean>;

    /**
     * Checks if subscription delegation is enabled
     * @returns true if subscription delegation is enabled
     */
    isSubscriptionDelegationEnabled(): Promise<boolean>

    /**
     * Get delegation signin url
     * @param returnUrl - url to redirect to after signin
     * @returns delegation signin url
     */
    getDelegationSigninUrl(returnUrl: string): Promise<string>

    /**
     * Get delegation url
     * @param action - delegation action
     * @param userId
     * @param productId
     * @param subscriptionId
     * @returns delegation url
     */
    getUserDelegationUrl(action: DelegationAction, userId: string, productId?: string, subscriptionId?: string): Promise<string>
}

//TODO:hh signup action?, some delegations without userId?