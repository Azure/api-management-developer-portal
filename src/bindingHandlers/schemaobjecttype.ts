import * as ko from "knockout";
import { TypeDefinition } from "../models/schema";
import { Utils } from "../utils";

ko.bindingHandlers["schemaobjecttype"] = {
    init: (element: HTMLElement, valueAccessor: () => TypeDefinition): void => {
        const value = ko.unwrap(valueAccessor());

        let label;
        let href;

        if (value.type) {
            label = value.type;
        }
        else {
            label = "Object";
        }

        const reference = value.$ref;

        if (reference) {
            if (reference.startsWith("#/definitions/")) {
                href = reference;

                if (label === "Object") {
                    label = reference.substring(14);
                }

                href = `#${reference.substring(14)}`;
            }
            else {
                href = reference;
            }

            ko.applyBindingsToNode(element, { html: `<a href="${href}">${label}</a>`}, null);
        }
        else {
            label = value.type;
            ko.applyBindingsToNode(element, { text: label }, null);
        }
    }
};