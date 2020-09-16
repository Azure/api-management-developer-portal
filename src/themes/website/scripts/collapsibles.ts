import { Keys } from "@paperbits/common";

const dropDownCollapsibleContentSelector = ".collapsible-dropdown.collapsible-content";
const paginationSelector = ".pagination";
const collapsibleSelector = ".collapsible";
const collapsibleToggleSelector = "[data-toggle]";
const collapsibleExpandedClass = "expanded";
const collapsibleExpandedAriaAttr = "exaria-expanded";

const selfAndParents = (element: HTMLElement) => {
    const elements = [element];

    while (element.parentElement && element.parentElement.tagName !== "BODY") {
        elements.push(element.parentElement);
        element = element.parentElement;
    }

    return elements;
};

const onClick = (event: MouseEvent) => {
    if (event.which !== 1) {
        return;
    }
    onActivate();
};

const onKeyDown = (event: KeyboardEvent) => {
    if (event.keyCode !== Keys.Enter && event.keyCode !== Keys.Space) {
        return;
    }
    onActivate();
};

const onActivate = (): void => {
    const target = <HTMLElement>event.target;
    const collapsibles: HTMLElement[] = Array.prototype.slice.call(document.querySelectorAll(collapsibleSelector));

    let toggleElement: HTMLElement;

    if (target.closest) {
        toggleElement = target.closest(collapsibleToggleSelector);
        if (!toggleElement && target.nodeName !== "INPUT") {
            const pagerElement = target.closest(paginationSelector);
            if (!pagerElement) {
                toggleElement = target.closest(dropDownCollapsibleContentSelector)?.parentElement.querySelector(collapsibleToggleSelector);
            }
        }
    }

    const exclude = selfAndParents(target);

    if (toggleElement) {
        const collapsible: HTMLElement = toggleElement.closest(collapsibleSelector);

        if (collapsible) {
            collapsible.classList.toggle(collapsibleExpandedClass);
        }

        const expanded = collapsible.classList.contains(collapsibleExpandedClass);
        toggleElement.setAttribute(collapsibleExpandedAriaAttr, expanded.toString());
    }

    collapsibles.forEach(x => {
        if (!exclude.includes(x)) {
            x.classList.remove(collapsibleExpandedClass);

            const toggleElement = x.querySelector(collapsibleToggleSelector);

            if (toggleElement) {
                toggleElement.setAttribute(collapsibleExpandedAriaAttr, "false");
            }
        }
    });
};

document.addEventListener("click", onClick, true);
document.addEventListener("keydown", onKeyDown, true);