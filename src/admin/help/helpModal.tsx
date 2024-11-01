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

const headerStyles = { root: { paddingTop: 15, margin: 0 } };

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

    setTips = async (): Promise<void> => {
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

    render(): JSX.Element {
        return <>
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text as="h2" className="admin-modal-header-text">Help and resources</Text>
                    <DefaultButton text="Close" onClick={this.props.onDismiss} />
                </Stack>
                <div className="admin-modal-content">
                    <Text as="h3" block variant="large" styles={headerStyles}>Getting started</Text>
                    <ul>
                        <li><Text block><Link href="https://aka.ms/apimdocs/portal" target="_blank">Overview</Link> of the developer portal.</Text></li>
                        <li><Text block><Link href="https://aka.ms/apimdocs/customizeportal" target="_blank">Access and customize the developer portal</Link> with a step-by-step tutorial.</Text></li>
                    </ul>
                    
                    <Text as="h3" block variant="large" styles={headerStyles}>How-to</Text>
                    <ul>
                        <li><Text block><Link href="https://aka.ms/apimdocs/portal/cors" target="_blank">Enable CORS</Link></Text></li>
                        <li><Text block><Link href="https://aka.ms/apimdocs/portal/access" target="_blank">Secure access to the API Management developer portal</Link></Text></li>
                        <li><Text block><Link href="https://aka.ms/apimdocs/portal/customization" target="_blank">Add custom features to the developer portal</Link></Text></li>
                    </ul>

                    <Text as="h3" block variant="large" styles={headerStyles}>Give feedback</Text>
                    <ul>
                        <li><Text block>Read release notes, report issues, or request features in the <Link href="https://github.com/Azure/api-management-developer-portal/issues" target="_blank">GitHub repo</Link>.</Text></li>
                    </ul>

                    <Text as="h3" block variant="large" styles={headerStyles}>Support</Text>
                    <ul>
                        <li><Text block>For solutions and support, contact Azure support using the Azure portal interface of your API Management service under <b>Help &gt; Support + Troubleshooting</b> in the table of contents. </Text></li>
                    </ul>
                </div>
            </Modal>
        </>
    }
}