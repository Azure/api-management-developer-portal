import * as ko from "knockout";

export class TreeViewNode {
    public id: string;
    public name: string;
    public label: KnockoutObservable<string>;
    public expanded?: KnockoutObservable<boolean>;
    public nodes: KnockoutObservableArray<TreeViewNode>;
    public data: KnockoutObservable<any>;
    public level?: KnockoutObservable<string>;
    public hasChildren: KnockoutComputed<boolean>;
    public hasActiveChild: KnockoutComputed<boolean>;

    public onSelect: (node: TreeViewNode) => void;
    public isSelected: () => boolean;

    constructor(label: string) {
        this.select = this.select.bind(this);
        this.toggle = this.toggle.bind(this);

        this.label = ko.observable(label);
        this.nodes = ko.observableArray([]);
        this.isSelected = ko.observable(false);
        this.expanded = ko.observable(false);
        this.level = ko.observable("level-1");
        this.data = ko.observable();

        this.hasChildren = ko.pureComputed(() => {
            return this.nodes().length > 0;
        });

        this.hasActiveChild = ko.pureComputed(() => {
            return this.hasChildren() && (this.nodes().some(x => x.hasActiveChild() || x.isSelected()));
        });
    }

    public select(): void {
        this.expanded(true);
        this.onSelect(this);
    }

    public toggle(): void {
        if (!this.expanded()) {
            this.expanded(true);
            this.select();
        }
        else {
            this.expanded(false);
        }
    }
}