export interface AccessToken {
    /**
     * Type of token, i.e. Bearer or SharedAccessSignature.
     */
    type: string;

    /**
     * Token expiration date time.
     */
    expires: Date;

    /**
     * User for whom the token was issued.
     */
    userId?: string;

    /**
     * Token value.
     */
    value: string;
}