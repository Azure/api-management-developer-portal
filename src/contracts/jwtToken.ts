export interface JwtToken {
    /**
     * Authentication context class
     */
    acr: string;

    /**
     * Authentication methods array
     */
    amr: string[];

    /**
     * Application ID
     */
    appid: string;

    /**
     * Audience (who or what the token is intended for)
     */
    aud: string;

    /**
     * Expiration time (UTC)
     */
    exp: Date;

    /**
     * Family name of the user
     */
    family_name: string;

    /**
     * Given name of the user
     */
    given_name: string;

    /**
     * Issued at (UTC)
     */
    iat: Date;

    /**
     * IP address
     */
    ipaddr: string;

    /**
     * Issuer (who created and signed this token)
     */
    iss: string;

    /**
     * Not valid before (UTC).
     */
    nbf: Date;

    /**
     * Object ID.
     */
    oid: string;

    /**
     * Subject (whom the token refers to)
     */
    sub: string;

    /**
     * Email address.
     */
    email: string;

    /**
     * Array of email addresses, e.g. AAD B2C.
     */
    emails: string;
}