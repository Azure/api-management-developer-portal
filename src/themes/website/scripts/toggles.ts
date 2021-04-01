import { Keys } from "@paperbits/common";
import { AriaAttributes } from "@paperbits/common/html";

const toggleAtributeName = "data-toggle";
const targetAttributeName = "data-target";
const dismissAttributeName = "data-dismiss";
const showClassName = "show";


const onClick = (event: MouseEvent) => {
    if (event.button !== 0) {
        return;
    }

    const clickedElement = <HTMLElement>event.target;
    const toggleElement = <HTMLElement>clickedElement.closest(`[${toggleAtributeName}]`);

    if (!toggleElement) {
        return;
    }

    event.preventDefault();

    const toggleType = toggleElement.getAttribute(toggleAtributeName);

    switch (toggleType) {
        case "popup":
            const targetSelector = toggleElement.getAttribute(targetAttributeName);

            if (!targetSelector) {
                return;
            }

            const targetElement = <HTMLElement>document.querySelector(targetSelector);

            if (!targetElement) {
                return;
            }

            onShowPopup(toggleElement, targetElement);
            break;

        case "dropdown":
            onShowDropdown(toggleElement);
            break;

        case "collapsible":
            onShowCollapsible(toggleElement);
            break;

        default:
            console.warn(`Unknown data-toggle value ${toggleType}`);
    }
};

const onKeyDown = (event: KeyboardEvent) => {
    if (event.keyCode !== Keys.Enter && event.keyCode !== Keys.Space) {
        return;
    }
};

const onShowCollapsible = (toggleElement: HTMLElement): void => {
    const collapsiblePanelElement = toggleElement.closest(".collapsible-panel");
    const collapsiblePanelDismissElement = collapsiblePanelElement.querySelector(`[${dismissAttributeName}]`);

    collapsiblePanelElement.classList.add(showClassName);
    toggleElement.setAttribute(AriaAttributes.expanded, "true");

    const closeCollapsible = () => {
        toggleElement.setAttribute(AriaAttributes.expanded, "false");
        collapsiblePanelElement.ownerDocument.removeEventListener("mousedown", associatedClick, true);
        collapsiblePanelDismissElement.removeEventListener("mousedown", associatedClick);
        collapsiblePanelElement.classList.remove(showClassName);
    };

    const associatedClick = (event: MouseEvent) => {
        const clickedElement = <HTMLElement>event.target;

        if (collapsiblePanelElement.contains(clickedElement)) {
            return;
        }

        closeCollapsible();
    };

    collapsiblePanelElement.ownerDocument.addEventListener("mousedown", associatedClick, true);
    collapsiblePanelDismissElement.addEventListener("mousedown", closeCollapsible);
};

const onShowDropdown = (toggleElement: HTMLElement): void => {
    const dropdownElement = toggleElement.closest(".nav-item").querySelector(".dropdown");

    if (!dropdownElement) {
        return;
    }

    dropdownElement.classList.add(showClassName);
    toggleElement.setAttribute(AriaAttributes.expanded, "true");

    const associatedClick = (event: MouseEvent) => {
        toggleElement.setAttribute(AriaAttributes.expanded, "false");
        dropdownElement.ownerDocument.removeEventListener("mousedown", associatedClick, true);
        dropdownElement.classList.remove(showClassName);
    };

    dropdownElement.ownerDocument.addEventListener("mousedown", associatedClick, true);
};

const onShowPopup = (toggleElement: HTMLElement, targetElement: HTMLElement): void => {
    toggleElement.setAttribute(AriaAttributes.expanded, "true");

    const popupContainerElement: HTMLElement = targetElement.querySelector(".popup-container");

    const repositionPopup = () => {
        const computedStyles = getComputedStyle(popupContainerElement);

        if (computedStyles.position === "absolute") {
            const toggleElementRect = toggleElement.getBoundingClientRect();
            const popupContainerElement: HTMLElement = targetElement.querySelector(".popup-container");
            popupContainerElement.style.top = window.scrollY + toggleElementRect.bottom + "px";
            popupContainerElement.style.left = toggleElementRect.left + "px";
        }
        else {
            popupContainerElement.removeAttribute("style");
        }
    };

    repositionPopup();

    const popupDismissElement: HTMLElement = targetElement.querySelector("[data-dismiss]");

    const clickOutside = (event: MouseEvent) => {
        const clickTarget = <HTMLElement>event.target;

        if (clickTarget.nodeName === "BODY") {
            return;
        }

        const isPopupContainer = popupContainerElement.contains(clickTarget);

        if (isPopupContainer) {
            return;
        }

        closePopup();
    };

    const closePopup = () => {
        popupDismissElement.removeEventListener("mousedown", closePopup);
        targetElement.ownerDocument.removeEventListener("mousedown", clickOutside);
        document.removeEventListener("onPopupRepositionRequested", repositionPopup);
        targetElement.classList.remove(showClassName);
    };

    popupDismissElement.addEventListener("mousedown", closePopup);

    targetElement.classList.add(showClassName);

    setTimeout(() => {
        targetElement.ownerDocument.addEventListener("mousedown", clickOutside);
    }, 500);

    // Temporary hack to reposition popup:
    document.addEventListener("onPopupRepositionRequested", () => {
        setTimeout(() => {
            repositionPopup();
        }, 10);

    });
};

document.addEventListener("mousedown", onClick, true);
document.addEventListener("keydown", onKeyDown, true);