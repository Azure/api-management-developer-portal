import { ArmResource } from "./armResource";

export interface UserContract extends ArmResource {
    properties: UserPropertiesContract;
}

export interface UserIdentity {
    /**
     * Identifier value within provider.
     */
    id: string;

    /**
     * Identity provider name.
     */
    provider: string;
}

export interface UserPropertiesContract {
    /**
     * First name.
     */
    firstName: string;

    /**
     * Last name.
     */
    lastName: string;

    /**
     * Email address.
     */
    email: string;

    /**
     * Account state. Specifies whether the user is active or not. Blocked users are unable
     * to sign into the developer portal or call any APIs of subscribed products.
     * Default state is Active.
     */
    state?: string;

    /**
     * Date of user registration. The date conforms to the following format:
     * yyyy-MM-ddTHH:mm:ssZ as specified by the ISO 8601 standard.
     */
    registrationDate?: Date;

    /**
     * Optional note about a user set by the administrator.
     */
    note?: string;

    /**
     * Collection of groups user is part of.
     */
    groups?: any[];

    /**
     * Collection of user identities.
     */
    identities?: UserIdentity[];

    /**
     *  Application type. Required to send notification with proper urls in emails.
     *  
     */
    appType: string;
}