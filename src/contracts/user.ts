import { ArmResource } from "./armResource";

export interface UserContract extends ArmResource {
    properties: {
        firstName: string;
        lastName: string;
        email: string;
        state: string;
        registrationDate: Date;
        note: string;
        groups?: any[];
        identities: {
            id: string;
            provider: string;
        }[];
    }
}