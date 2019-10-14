export class ProductListModel {
    public itemStyleView?: string;

    constructor(itemStyleView: string = "list") {
        this.itemStyleView = itemStyleView;
    }
}
