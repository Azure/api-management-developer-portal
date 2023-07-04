export interface menuItem {
    displayName: string;
    value: string;
    type: string;
}

export const menuItemType ={
     documentationMenuItemType : "documentation",
     staticMenuItemType : "static",
     operationMenuItem : "operation",
     graphqlMenuItem :"graphql"
}

export interface breadcrumbItem {
    title: string;
    url: string;
}
