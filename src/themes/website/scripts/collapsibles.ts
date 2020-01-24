const mousedown = (event: MouseEvent): void => {
    if (event.which !== 1) {
        return;
    }

    const target = <HTMLElement>event.target;

    if (!target.closest) {
        return;
    }

    const toggleElement = target.closest("[data-toggle]");

    if (!toggleElement) {
        return;
    }

    const collapsible: HTMLElement = toggleElement.closest(".collapsible");

    if (collapsible) {
        collapsible.classList.toggle("expanded");
    }
};

document.addEventListener("mousedown", mousedown, true);