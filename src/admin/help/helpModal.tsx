import * as React from 'react';
import { Resolve } from '@paperbits/react/decorators';
import { PolicyService } from '../../services/policyService';
import { DefaultButton, Link, Modal, Stack, Text } from '@fluentui/react';

interface HelpModalState {
    showCors: boolean,
    showDomain: boolean
}

interface HelpModalProps {
    onDismiss: () => void
}

const headerStyles = { root: { padding: '25px 0 15px' } };

export class HelpModal extends React.Component<HelpModalProps, HelpModalState> {
    @Resolve('policyService')
    public policyService: PolicyService;

    constructor(props: HelpModalProps) {
        super(props);

        this.state = {
            showCors: false,
            showDomain: false
        }
    }

    componentDidMount(): void {
        this.setTips();
    }

    setTips = async () => {
        const tips: HelpModalState = this.state;

        const globalPolicyXml = await this.policyService.getPolicyXmlForGlobalScope();

        if (!globalPolicyXml.toLowerCase().includes("<cors>")) {
            tips.showCors = true;
        }

        if (location.hostname.endsWith(".developer.azure-api") || location.hostname.endsWith("localhost")) {
            tips.showDomain = true;
        }

        this.setState(tips);
    }

    render() {
        return <>
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text className="admin-modal-header-text">Help</Text>
                    <DefaultButton text="Close" onClick={this.props.onDismiss} />
                </Stack>
                <div className="admin-modal-content">
                    <Text block variant="large" styles={{ root: { paddingBottom: 15 }}}>General</Text>
                    <Text block>
                        Go to <Link href="https://aka.ms/apimdocs/portal" target="_blank">this documentation article</Link> to learn more about
                        the API Management developer portal.
                    </Text>
                    {this.state.showCors && 
                        <>
                            <Text block variant="large" styles={headerStyles}>Setup CORS policy</Text>
                            <Text block>
                                The interactive console of the Developer portal makes client-side API requests directly from the browser, this requires
                                Cross-Origin Resource Sharing (CORS) enabled on the server.
                            </Text>
                            <Text block>
                                You can enable it by adding a CORS policy on your API(s). <Link href="https://aka.ms/AA4e482" target="_blank">Learn more</Link>
                            </Text>
                        </>
                    }
                    {this.state.showDomain && 
                        <>
                            <Text block variant="large" styles={headerStyles}>Setup custom domain</Text>
                            <Text block>
                                By default, your API Management service instance is available through *.azure-api.net subdomain (e.g.
                                contoso.developer.azure-api.net). You can also expose the service through your own domain name, such as contoso.com.
                                <Link href="https://docs.microsoft.com/en-us/azure/api-management/configure-custom-domain" target="_blank">Learn more</Link>
                            </Text>
                        </>
                    }
                </div>
            </Modal>
        </>
    }
}