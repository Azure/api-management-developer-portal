import { HtmlPage } from "@paperbits/common/publishing/htmlPage";
import { HtmlPagePublisherPlugin } from "@paperbits/common/publishing/htmlPagePublisherPlugin";
import { ISettingsProvider } from "@paperbits/common/configuration";
 
export class NhsWalesPagePublisherPlugin implements HtmlPagePublisherPlugin {
    constructor(
        private readonly settingsProvider: ISettingsProvider,
    ) { }

    public async apply(document: Document, page: HtmlPage): Promise<void> {
        const settings = await this.settingsProvider.getSettings();
        return new Promise(async (resolve, reject) => {
            try {

                const hotJarId = settings["hotJarId"];
                const instrumentationKey = settings["azureInsightsInstrumentationKey"];

                if(hotJarId || instrumentationKey)
                {
                    const scriptTag = document.createElement("script");

                    if(hotJarId)
                    {
                        scriptTag.innerHTML = `/* Hotjar Tracking Code */
                        (function(h,o,t,j,a,r){
                            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                            h._hjSettings={hjid:${hotJarId},hjsv:6};
                            a=o.getElementsByTagName('head')[0];
                            r=o.createElement('script');r.async=1;
                            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                            a.appendChild(r);
                        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`;    
                    }

                    if(instrumentationKey)
                    {
                        scriptTag.innerHTML += `/* Application Insights*/
                        var sdkInstance="appInsightsSDK";window[sdkInstance]="appInsights";var aiName=window[sdkInstance],aisdk=window[aiName]||function(e){function n(e){t[e]=function(){var n=arguments;t.queue.push(function(){t[e].apply(t,n)})}}var t={config:e};t.initialize=!0;var i=document,a=window;setTimeout(function(){var n=i.createElement("script");n.src=e.url||"https://az416426.vo.msecnd.net/scripts/b/ai.2.min.js",i.getElementsByTagName("script")[0].parentNode.appendChild(n)});try{t.cookie=i.cookie}catch(e){}t.queue=[],t.version=2;for(var r=["Event","PageView","Exception","Trace","DependencyData","Metric","PageViewPerformance"];r.length;)n("track"+r.pop());n("startTrackPage"),n("stopTrackPage");var s="Track"+r[0];if(n("start"+s),n("stop"+s),n("setAuthenticatedUserContext"),n("clearAuthenticatedUserContext"),n("flush"),!(!0===e.disableExceptionTracking||e.extensionConfig&&e.extensionConfig.ApplicationInsightsAnalytics&&!0===e.extensionConfig.ApplicationInsightsAnalytics.disableExceptionTracking)){n("_"+(r="onerror"));var o=a[r];a[r]=function(e,n,i,a,s){var c=o&&o(e,n,i,a,s);return!0!==c&&t["_"+r]({message:e,url:n,lineNumber:i,columnNumber:a,error:s}),c},e.autoExceptionInstrumented=!0}return t}({
                            instrumentationKey:"${instrumentationKey}"
                        });window[aiName]=aisdk,aisdk.queue&&0===aisdk.queue.length&&aisdk.trackPageView({});`
                    }
                    
                    document.head.appendChild(scriptTag);
                } 
                
                //add cache busting query parameter to local resources
                const publishTimestamp = `v=${new Date().toISOString().replace(/[^\d]/g,'')}`;
                document.querySelectorAll("script[src^='/']").forEach(scriptTag => scriptTag.setAttribute("src", this.addQueryParam(scriptTag["src"], publishTimestamp)))
                document.querySelectorAll("link[href^='/']").forEach(linkTag => linkTag.setAttribute("href",this.addQueryParam(linkTag["href"], publishTimestamp)))
                
                setTimeout(resolve, 500);

                }
                catch (error) {
                reject(`Unable to apply knockout bindings to a template: ${error}`);
            }
        });
    }

    private addQueryParam(url:string, param:string){
        let q = "?"
        if (url.indexOf("?") > -1 ){
            q = "&" //TODO: Figure out why this is being turned into &amp; in the published site
        }
        return url + q + param
    }
}
