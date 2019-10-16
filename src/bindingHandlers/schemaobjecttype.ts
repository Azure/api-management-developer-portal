import * as ko from "knockout";
import { SchemaObject } from "../models/schema";
import { Utils } from "../utils";

ko.bindingHandlers["schemaobjecttype"] = {
    init: (element: HTMLElement, valueAccessor: () => SchemaObject): void => {
        const schemaObject = ko.unwrap(valueAccessor());

        let label;
        let href;

        if (schemaObject.type) {
            label = schemaObject.type;
        }
        else {
            label = "Object";
        }

        if (schemaObject.$ref) {
            if (schemaObject.$ref.startsWith("#/definitions/")) {
                href = schemaObject.$ref;

                if (label === "Object") {
                    label = schemaObject.$ref.substring(14);
                }

                href = `#${schemaObject.$ref.substring(14)}`;
            }
            else {
                href = schemaObject.$ref;
            }

            ko.applyBindingsToNode(element, { html: `<a href="">${label}</a>`, click: () => Utils.scrollTo(label)}, null);
        }
        else {
            label = schemaObject.type;
            ko.applyBindingsToNode(element, { text: label }, null);
        }
    }
}