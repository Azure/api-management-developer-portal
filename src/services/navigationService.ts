import * as Utils from "@paperbits/common/utils";
import { IBlockService } from "@paperbits/common/blocks";
import { Contract } from "@paperbits/common/contract";
import { SmapiClient } from "../services/smapiClient";
import { Page } from "../models/page";
import { HttpHeader } from "@paperbits/common/http";

import { IEventManager } from "@paperbits/common/events";
import { INavigationService } from "@paperbits/common/navigation";
import { NavigationItemContract } from "@paperbits/common/navigation/navigationItemContract";
import { NavigationEvents } from "@paperbits/common/navigation/navigationEvents";

const navigationItemsPath = "contentTypes/document/contentItems/navigation";

export class NavigationService implements INavigationService {
    constructor(
        private readonly eventManager: IEventManager,
        private readonly smapiClient: SmapiClient
    ) {

        // rebinding....
        this.getNavigationItem = this.getNavigationItem.bind(this);
    }

    private find(items: NavigationItemContract[], key: string): NavigationItemContract {
        for (const item of items) {
            if (item.key === key) {
                return item;
            }
            else if (item.navigationItems) {
                const child = this.find(item.navigationItems, key);

                if (child) {
                    return child;
                }
            }
        }
    }

    public async getNavigationItem(navigationItemKey: string): Promise<NavigationItemContract> {
        const items = await this.getNavigationItems();
        const node = this.find(items, navigationItemKey);

        return node;
    }

    public async getNavigationItems(): Promise<NavigationItemContract[]> {
        const pageOfNavigationNodes: any = await this.smapiClient.get<NavigationItemContract>(navigationItemsPath);
        return pageOfNavigationNodes.nodes;
    }

    public async updateNavigationItem(navigationItem: NavigationItemContract): Promise<void> {
        debugger;

        // const path = navigationItem.key;

        // await this.objectStorage.updateObject(`${navigationItemsPath}/${path}`, navigationItem);

        // this.eventManager.dispatchEvent(NavigationEvents.onNavigationItemUpdate, navigationItem);


        // const pageKey = `${pagesPath}/${identifier}`;

        // await this.smapiClient.put<any>(contentKey, [], template);
    }

    public async updateNavigation(navigationItems: NavigationItemContract[]): Promise<void> {
        const navigation = {
            nodes: navigationItems
        };

        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });
        await this.smapiClient.put<any>(navigationItemsPath, headers, navigation);

        navigationItems.forEach(async navigationItem => {
            this.eventManager.dispatchEvent(NavigationEvents.onNavigationItemUpdate, navigationItem);
        });
    }
}