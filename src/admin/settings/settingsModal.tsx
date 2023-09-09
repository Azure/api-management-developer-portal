import * as React from 'react';
import { Resolve } from '@paperbits/react/decorators';
import { ISiteService, SiteSettingsContract } from '@paperbits/common/sites';
import { IMediaService, MediaContract } from '@paperbits/common/media';
import { EventManager } from '@paperbits/common/events';
import { CommandBarButton, DefaultButton, Image, ImageFit, Label, Modal, PrimaryButton, Stack, Text, TextField } from '@fluentui/react';
import { MediaSelectionItemModal } from '../media/mediaSelectionItemModal';
import { getThumbnailUrl } from '../utils/helpers';
import { ResetDetailsWorkshop } from '../../components/content';

interface SettingsModalState {
    initialSettings: SiteSettingsContract,
    settings: SiteSettingsContract,
    faviconThumbnailUrl: string,
    selectedFavicon: MediaContract,
    showMediaSelectionModal: boolean,
    showResetConfirmation: boolean,
    resetConfirmation: string
}

interface SettingsModalProps {
    onDismiss: () => void
}

const inputStyles = { root: { paddingBottom: 15 } };

export class SettingsModal extends React.Component<SettingsModalProps, SettingsModalState> {
    @Resolve('siteService')
    public siteService: ISiteService;

    @Resolve('mediaService')
    public mediaService: IMediaService;

    @Resolve('eventManager')
    public eventManager: EventManager;

    @Resolve('resetDetailsWorkshop')
    public resetDetailsWorkshop: ResetDetailsWorkshop;

    constructor(props: SettingsModalProps) {
        super(props);

        this.state = {
            initialSettings: null,
            settings: null,
            faviconThumbnailUrl: '',
            selectedFavicon: null,
            showMediaSelectionModal: false,
            showResetConfirmation: false,
            resetConfirmation: ''
        }
    }

    componentDidMount(): void {
        this.loadSettings();
    }

    componentDidUpdate(prevProps: Readonly<SettingsModalProps>, prevState: Readonly<SettingsModalState>, snapshot?: any): void {
        if (this.state.selectedFavicon !== prevState.selectedFavicon) {
            this.getFaviconThumbnailUrl(this.state.selectedFavicon);
            this.onInputChange('faviconSourceKey', this.state.selectedFavicon.key)
        }
    }

    loadSettings = async (): Promise<void> => {
        const settings = await this.siteService.getSetting<SiteSettingsContract>('site');
        const faviconFile = await this.mediaService.getMediaByKey(settings.faviconSourceKey);
        this.setState({ initialSettings: settings, settings: settings });
        this.getFaviconThumbnailUrl(faviconFile);
    }

    getFaviconThumbnailUrl = async (faviconFile: MediaContract): Promise<void> => {
        const thumbnailUrl = getThumbnailUrl(faviconFile);
        this.setState({ faviconThumbnailUrl: thumbnailUrl });
    }

    onInputChange = (field: string, newValue: string): void => {
        this.setState({
            settings: {
                ...this.state.settings,
                [field]: newValue
            }
        });
    }

    selectMedia = (mediaItem: MediaContract): void => {
        this.setState({ selectedFavicon: mediaItem, showMediaSelectionModal: false });
    }

    closeMediaSelection = (): void => {
        this.setState({ showMediaSelectionModal: false });
    }

    saveChanges = async (): Promise<void> => {
        await this.siteService.setSetting('site', this.state.settings);
        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    render(): JSX.Element {
        return <>
            {this.state.showMediaSelectionModal &&
                <MediaSelectionItemModal
                    selectMedia={this.selectMedia.bind(this)}
                    onDismiss={this.closeMediaSelection.bind(this)}
                />
            }
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text className="admin-modal-header-text">Settings</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <PrimaryButton
                            text="Save"
                            onClick={() => this.saveChanges()}
                            disabled={JSON.stringify(this.state.initialSettings) === JSON.stringify(this.state.settings)}
                        />
                        <DefaultButton text="Discard" onClick={this.props.onDismiss} />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    <Label>Favicon</Label>
                    <Stack horizontal verticalAlign="center">
                        <Image
                            src={this.state.faviconThumbnailUrl ?? '/assets/images/no-preview.png'}
                            imageFit={ImageFit.centerCover}
                            styles={{ root: { height: 60, width: 60, margin: '15px 15px 15px 0' } }}
                        />
                        <CommandBarButton
                            iconProps={{ iconName: 'Upload' }}
                            text="Setup favicon"
                            onClick={() => this.setState({ showMediaSelectionModal: true })}
                            styles={{ root: { height: 44 } }}
                        />
                    </Stack>
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
                        styles={{ root: { paddingBottom: 30 } }}
                    />
                    <DefaultButton text="Reset content" onClick={() => this.setState({ showResetConfirmation: true })} />
                    <Stack
                        horizontalAlign="start"
                        className={`collapsible-section${!this.state.showResetConfirmation ? ' hidden' : ''}`}
                        styles={{ root: { paddingTop: 20 } }}
                    >
                        <Text block>Resetting the content will restore the portal to its initial state. It will replace all the pages, layouts,
                        customizations, uploaded media, etc. with the default content.</Text>
                        <Text block>Resetting the content will not remove the published version of the portal.</Text>
                        <Text block>Are you sure you want to reset the portal's content? Type "yes" in the field below to confirm.</Text>
                        <TextField
                            placeholder="Confirm by entering yes"
                            onChange={(event, value) => this.setState({ resetConfirmation: value })}
                            styles={{ root: { width: '100%', padding: '20px 0 5px' } }}
                        />
                        <CommandBarButton
                            iconProps={{ iconName: 'CheckMark' }}
                            text="Reset content"
                            onClick={() => this.resetDetailsWorkshop.reset()}
                            styles={{ root: { height: 44 } }}
                            disabled={this.state.resetConfirmation !== 'yes'}
                        />
                    </Stack>
                </div>
            </Modal>
        </>
    }
}