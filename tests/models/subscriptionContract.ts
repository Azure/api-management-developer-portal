export interface SubscriptionContract {
    properties: SubscriptionProperties;
}

export interface SubscriptionProperties{
    displayName: string;

    createdDate: string;

    endDate: string;

    expirationDate: string;

    notificationDate: string;

    primaryKey: string;

    scope: string;

    secondaryKey: string;

    startDate: string;

    state: string;

    stateComment: string;
    
    ownerId: string;
}