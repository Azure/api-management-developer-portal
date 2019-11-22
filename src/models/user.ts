import { UserContract } from "../contracts/user";
import { Utils } from "../utils";

export class User {
    public id: string;
    public firstName: string;
    public lastName: string;
    public email: string;
    public state: UserState;
    public registrationDate: Date;
    public note: string;
    public groups?: UserGroup[];
    public identities: UserIdentity[];
    public isBasicAccount: boolean;

    constructor(contract: UserContract) {
        this.id = Utils.getResourceName("users", contract.id, "shortId");
        this.firstName = contract.properties.firstName;
        this.lastName = contract.properties.lastName;
        this.email = contract.properties.email;
        this.state = <any>contract.properties.state;
        this.registrationDate = contract.properties.registrationDate;
        this.note = contract.properties.note;
        this.groups = contract.properties.groups;
        this.identities = contract.properties.identities;
        this.isBasicAccount = this.identities[0]?.provider === "Basic";
    }
}

export class UserGroup {
    public id: string;
    public name: string;
    public description: string;
    public builtIn: boolean;
    public type: UserGroupType;
    public externalId: string;
}

export interface UserIdentity {
    id: string;
    provider: string;
}

export enum UserState {
    active = "active",
    blocked = "blocked",
    pending = "pending",
    deleted = "deleted"
}

export enum UserGroupType {
    custom = 0,
    system = 1,
    external = 2
}