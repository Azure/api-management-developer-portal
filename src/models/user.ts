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
}

export class UserGroup {
    public id: string;
    public name: string;
    public description: string;
    public builtIn: boolean;
    public type: UserGroupType;
    public externalId: string;
}

export class UserIdentity {
    public id: string;
    public provider: string;
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