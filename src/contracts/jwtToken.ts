export interface JwtToken {
    /**
     * Authentication context class
     */
    acr: string;

    aio: string;

    /**
     * Authentication methods array
     */
    amr: string[];

    /**
     * Application ID
     */
    appid: string;

    appidacr: string;

    /**
     * Audience (who or what the token is intended for)
     */
    aud: string;

    deviceid: string;

    /**
     * Expiration time (seconds since Unix epoch)
     */
    exp: number;

    /**
     * Family name of the user
     */
    family_name: string;

    /**
     * Given name of the user
     */
    given_name: string;

    hasgroups: string;

    /**
     * Issued at (seconds since Unix epoch)
     */
    iat: number;

    /**
     * IP address
     */
    ipaddr: string;

    /**
     * Issuer (who created and signed this token)
     */
    iss: string;
    name: string;

    /**
     * Not valid before (seconds since Unix epoch)
     */
    nbf: number;

    /**
     * Object ID.
     */
    oid: string;
    onprem_sid: string;
    puid: string;
    scp: string;

    /**
     * Subject (whom the token refers to)
     */
    sub: string;
    tid: string;
    unique_name: string;
    upn: string;
    uti: string;
    ver: string;

    /**
     * Email address.
     */
    email: string;
}