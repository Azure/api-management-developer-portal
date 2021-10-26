import { MenuItem } from "./menuItem";

export class Menu {
    public menuItems?: Array<MenuItem>;
    public menus?: Array<Menu>;
    public path?: string;  // Parameter to send in url to dynamically render
    public url?: string;

    public constructor(path?: string, url?: string, menuItems?: Array<MenuItem>, menus?: Array<Menu>) {
        this.path = path || '';
        this.url = url || '';
        this.menuItems = menuItems || new Array<MenuItem>();
        this.menus = menus || new Array<Menu>();
    }
}