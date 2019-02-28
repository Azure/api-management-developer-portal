import * as ko from "knockout";

export class TreeViewNode {
    public id: string;
    public name: string;
    public label: ko.Observable<string>;
    public expanded?: ko.Observable<boolean>;
    public nodes: ko.ObservableArray<TreeViewNode>;
    public data: ko.Observable<any>;
    public level?: ko.Observable<string>;
    public hasChildren: ko.Computed<boolean>;
    public hasActiveChild: ko.Computed<boolean>;

    public onSelect: (node: TreeViewNode) => void;
    public isSelected: () => boolean;

    constructor(label: string) {
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