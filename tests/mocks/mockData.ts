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

export const bookStoreApiProductsWithNextLink = {
    "value": [
        {
            "id": "starter",
            "name": "Starter",
            "description": "Subscribers will be able to run 5 calls/minute up to a maximum of 100 calls/week.",
            "terms": "",
            "subscriptionRequired": true,
            "approvalRequired": false,
            "subscriptionsLimit": null
        },
        {
            "id": "unlimited",
            "name": "Unlimited",
            "description": "Subscribers have completely unlimited access to the API. Administrator approval is required.",
            "terms": null,
            "subscriptionRequired": true,
            "approvalRequired": false,
            "subscriptionsLimit": null
        }
    ],
    "nextLink": "https://contoso.developer.azure-api.net/developer/users/123/apis/book-store-api/products/nextLink"
};

export const bookStoreApiProducts = {
    "value": [
        {
            "id": "starter1",
            "name": "Starter1",
            "description": "Subscribers will be able to run 5 calls/minute up to a maximum of 100 calls/week.",
            "terms": "",
            "subscriptionRequired": true,
            "approvalRequired": false,
            "subscriptionsLimit": null
        },
        {
            "id": "unlimited1",
            "name": "Unlimited1",
            "description": "Subscribers have completely unlimited access to the API. Administrator approval is required.",
            "terms": null,
            "subscriptionRequired": true,
            "approvalRequired": false,
            "subscriptionsLimit": null
        }
    ],
    "nextLink": undefined
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

export const mapiApiBookStoreSchema = {
    id: "/apis/book-store-api/schemas/test-schema",
    name: "65de1e785ddd1715acd486b2",
    properties: {
        contentType: "application/vnd.oai.openapi.components+json",
        document: {
            components: {
                schemas: {
                    Book: {
                        type: "object",
                        properties: {
                            data: {
                                type: "array",
                                items: {
                                    $ref: "#/components/schemas/BookData"
                                },
                                description: "Book info mapi"
                            }
                        }
                    }
                }
            }
        }
    },
    contentType: "application/vnd.oai.openapi.components+json",
    type: "Microsoft.ApiManagement/service/apis/schemas"
}

export const dataApiBookStoreSchema = {
    id: "test-schema",
    contentType: "application/vnd.oai.openapi.components+json",
    document: {
        components: {
            schemas: {
                Book: {
                    type: "object",
                    properties: {
                        data: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/BookData"
                            },
                            description: "Book info dataapi"
                        }
                    }
                }
            }
        }
    }
}