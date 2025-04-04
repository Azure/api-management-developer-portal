export interface ProductContract {
    properties: ProductPorperties;
}

export interface ProductPorperties{
    displayName: string;

    description: string;

    approvalRequired: boolean;

    state: string;

    subscriptionRequired: boolean;

    subscriptionsLimit: number;
    
    terms: string;
}