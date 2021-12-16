import { LanguageServiceApi, schemaDefault, formattingDefaults, modeConfigurationDefault } from "./languageServiceApi";
import { QueryEditorSettings } from "./../../../../../../constants";

let languageServiceApi: LanguageServiceApi;

export function setupGraphQLQueryIntellisense(graphQLSchema: string): void {
    
    if (languageServiceApi) {
        languageServiceApi.setSchema(graphQLSchema);
        return;
    }

    languageServiceApi = new LanguageServiceApi({
        languageId: QueryEditorSettings.config.language,
        schemaConfig: schemaDefault,
        formattingOptions: formattingDefaults,
        modeConfiguration: modeConfigurationDefault,
    });

    const monacoInstance = (<any>window).monaco;

    monacoInstance.languages.register({
        id: QueryEditorSettings.config.language,
        extensions: [".graphql", ".gql"],
        aliases: ["graphql"],
        mimetypes: ["application/graphql", "text/graphql"],
    });

    languageServiceApi.setSchema(graphQLSchema);

    monacoInstance.languages.onLanguage(QueryEditorSettings.config.language, async () => {
        const graphqlMode = await import("./graphqlMode");
        graphqlMode.setupMode(languageServiceApi);
    });
}