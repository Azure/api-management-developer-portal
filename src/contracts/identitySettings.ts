import { ArmResource } from "./armResource";

/**
 * Contract that describes the identity setting for signup
 */
export interface IdentitySettingContract extends ArmResource {
    /**
     * The id of the identity settings
     */
    id: string;

    /**
     * The name of the identity settings, ex. signup
     */
    name: string;

    /**
     * The property of the identity settings
     */
    properties: IdentitySettingProperties;
}

export interface IdentitySettingProperties {
    /**
     * Enable setting edition
     */
    enabled: boolean;

    /**
     * Terms of service: including term of use; require consent for the term of use
     */
    termsOfService: TermsOfService;
}

export interface TermsOfService {
    /**
     * Require the consent of the term of use
     */
    consentRequired: boolean;

    /**
     * Show terms of use on signup page
     */
    enabled: boolean;

    /**
     * The content of the term of use
     */
    text: string;
}
