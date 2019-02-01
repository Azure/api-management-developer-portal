export interface IWebApp {
	id: string;
	name: string;
	type: string;
	kind: string;
	location: string;
	properties: IWebAppProperty;
}

export interface IWebAppProperty {
	name: string;
	state: string;
	hostNames: string[];
}

export interface Binding {
	type: string;
	name: string;
	authLevel: string;
	direction: string;
}

export interface Config {
	bindings: Binding[];
	disabled: boolean;
}

export interface Property {
	name: string;
	function_app_id: string;
	script_root_path_href: string;
	script_href: string;
	config_href: string;
	secrets_file_href: string;
	href: string;
	config: Config;
	files?: any;
	test_data: string;
}

export interface FunctionItem {
	id: string;
	name: string;
	type: string;
	location: string;
	properties: Property;
}

export interface ApiDefinition {
	url: string;
}

export interface ConfigProperty {
	apiDefinition: ApiDefinition;
}

export interface IWebAppConfig {
	id: string;
	name: string;
	type: string;
	location: string;
	properties: ConfigProperty;
}