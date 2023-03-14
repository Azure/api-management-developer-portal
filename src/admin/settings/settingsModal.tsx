import * as React from 'react';
import { Resolve } from '@paperbits/react/decorators';
import { ISiteService, SiteSettingsContract } from '@paperbits/common/sites';
import { DefaultButton, Modal, PrimaryButton, Stack, Text, TextField } from '@fluentui/react';

interface SettingsModalState {
    settings: SiteSettingsContract
}

interface SettingsModalProps {
    onDismiss: () => void
}

const inputStyles = { root: { paddingBottom: 15 } };

export class SettingsModal extends React.Component<SettingsModalProps, SettingsModalState> {
    @Resolve('siteService')
    public siteService: ISiteService;

    constructor(props: SettingsModalProps) {
        super(props);

        this.state = {
            settings: null
        }
    }

    componentDidMount(): void {
        this.loadSettings();
    }

    loadSettings = async () => {
        const settings = await this.siteService.getSetting<SiteSettingsContract>('site');
        console.log(settings);
        this.setState({ settings: settings });
    }

    onInputChange = (field: string, newValue: string) => {
        this.setState({
            settings: {
                ...this.state.settings,
                [field]: newValue
            }
        });
    }

    saveChanges = async () => {
        await this.siteService.setSetting('site', this.state.settings);
        this.props.onDismiss();
    }

    render() {
        return <>
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text className="admin-modal-header-text">Settings</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <PrimaryButton text="Save" onClick={() => this.saveChanges()} />
                        <DefaultButton text="Discard" onClick={this.props.onDismiss} />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    <TextField
                        label="Title"
                        value={this.state.settings ? this.state.settings.title : ''}
                        onChange={(event, newValue) => this.onInputChange('title', newValue)}
                        styles={inputStyles}
                    />
                    <TextField
                        label="Description"
                        multiline
                        autoAdjustHeight
                        value={this.state.settings ? this.state.settings.description : ''}
                        onChange={(event, newValue) => this.onInputChange('description', newValue)}
                        styles={inputStyles}
                    />
                    <TextField
                        label="Keywords"
                        value={this.state.settings ? this.state.settings.keywords : ''}
                        onChange={(event, newValue) => this.onInputChange('keywords', newValue)}
                        styles={inputStyles}
                    />
                    <TextField
                        label="Author"
                        value={this.state.settings ? this.state.settings.author : ''}
                        onChange={(event, newValue) => this.onInputChange('author', newValue)}
                    />
                </div>
            </Modal>
        </>
    }
}