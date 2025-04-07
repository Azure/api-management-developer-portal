export interface UserContract {
    properties: UserProperties;
}

export interface UserProperties{
    email: string;

    firstName: string;

    lastName: string;

    state: string;

    password: string;

    appType: string;
}