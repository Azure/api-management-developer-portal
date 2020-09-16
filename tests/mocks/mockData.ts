export const bookStoreApi = {
    id: "/apis/book-store-api",
    type: "Microsoft.ApiManagement/service/apis",
    name: "book-store-api",
    properties: {
        displayName: "Book store API",
        description: null,
        serviceUrl: "https://contoso.azure-api.net/book-store-api",
        path: "book-store-api",
        protocols: ["https"],
        isCurrent: true
    }
};

export const starterProduct = {
    id: "/products/starter",
    type: "Microsoft.ApiManagement/service/products",
    name: "starter",
    properties: {
        displayName: "Starter",
        description: null,
        subscriptionRequired: true,
        approvalRequired: false,
        subscriptionsLimit: 1,
        state: "published"
    }
};