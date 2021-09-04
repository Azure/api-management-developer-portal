declare const require: any;

export class MonacoEditorLoader {
    private loadPromise: Promise<void>;

    public monacoPathVal = "assets/monaco-editor/vs";

    constructor() {
        this.loadPromise = new Promise<void>(resolve => {
            if (typeof ((<any>window).monaco) === "object") {
                resolve();
                return;
            }

            const onGotAmdLoader = () => {
                // Load monaco
                (<any>window).require.config({ paths: { vs: this.monacoPathVal } });
                (<any>window).require(["vs/editor/editor.main"], () => {
                    resolve();
                });
            };

            // Load AMD loader if necessary
            if (!(<any>window).require) {
                const loaderScript = document.createElement("script");
                loaderScript.type = "text/javascript";
                loaderScript.src = `${this.monacoPathVal}/loader.js`;

                loaderScript.addEventListener("load", onGotAmdLoader);
                document.body.appendChild(loaderScript);
            } else {
                onGotAmdLoader();
            }
        });
    }

    // Returns promise that will be fulfilled when monaco is available
    public waitForMonaco(): Promise<void> {
        return this.loadPromise;
    }
}