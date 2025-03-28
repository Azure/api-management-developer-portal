export interface ApiContract {
    properties: ApiProperties;
}

export interface ApiProperties{
    displayName: string;

    description: string;
   
    subscriptionRequired: boolean;

    path: string;

    protocols: string[]
}