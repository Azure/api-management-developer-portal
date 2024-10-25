import * as React from 'react';
import { isEqual } from 'lodash';
import { Resolve } from '@paperbits/react/decorators';
import { ISiteService, SiteSettingsContract } from '@paperbits/common/sites';
import { IMediaService, MediaContract } from '@paperbits/common/media';
import { MetaDataSetter } from "@paperbits/common/meta/metaDataSetter";
import { EventManager } from '@paperbits/common/events';
import { Checkbox, CommandBarButton, DefaultButton, Icon, Image, ImageFit, Label, Link, Modal, Pivot, PivotItem, PrimaryButton, Stack, Text, TextField } from '@fluentui/react';
import { MediaSelectionItemModal } from '../media/mediaSelectionItemModal';
import { getThumbnailUrl } from '../utils/helpers';
import { ResetDetailsWorkshop } from '../../components/content';

const enum Tab {
    Basic = 'basic',
    Advanced = 'advanced'
}

interface SettingsModalState {
    selectedTab: string,
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
            selectedTab: Tab.Basic,
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
            this.onInputChange('faviconSourceKey', this.state.selectedFavicon.key);
            MetaDataSetter.setFavIcon(this.state.selectedFavicon.downloadUrl);
        }
    }

    loadSettings = async (): Promise<void> => {
        const settings = await this.siteService.getSetting<SiteSettingsContract>('site');        
        this.setState({ initialSettings: settings, settings: settings });

        if (settings.faviconSourceKey) {
            const faviconFile = await this.mediaService.getMediaByKey(settings.faviconSourceKey);
            this.getFaviconThumbnailUrl(faviconFile); 
        }
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
        if (this.state.selectedTab === Tab.Advanced) {
            this.resetDetailsWorkshop.reset();
        } else {
            await this.siteService.setSetting('site', this.state.settings);
            this.eventManager.dispatchEvent('onSaveChanges');
        }

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
                    <Text as="h2" className="admin-modal-header-text">Settings</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <PrimaryButton
                            text="Save"
                            onClick={() => this.saveChanges()}
                            disabled={(this.state.selectedTab === Tab.Basic && isEqual(this.state.initialSettings, this.state.settings))
                            || (this.state.selectedTab === Tab.Advanced && this.state.resetConfirmation !== 'yes')}
                        />
                        <DefaultButton text="Discard" onClick={this.props.onDismiss} />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    <Pivot
                        aria-label="Settings tabs"
                        selectedKey={this.state.selectedTab}
                        onLinkClick={(item: PivotItem) => this.setState({ selectedTab: item.props.itemKey, showResetConfirmation: false, resetConfirmation: '' })}
                        styles={{ root: { marginBottom: 20 } }}
                    >
                        <PivotItem headerText="Basic" itemKey={Tab.Basic}>
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
                        </PivotItem>
                        <PivotItem headerText="Advanced" itemKey={Tab.Advanced}>
                            <Stack className="reset-content-wrapper">
                                <Text block styles={{ root: { fontWeight: 600 } }}>Restore website to default state</Text>
                                <Text block>By resetting the website, all the pages, layouts, customizations, and uploaded media, will be deleted. The published version of the developer portal will not be deleted.</Text>
                                <Checkbox
                                    label="Yes, reset the website to default state"
                                    checked={this.state.showResetConfirmation}
                                    onChange={() => this.setState({ showResetConfirmation: !this.state.showResetConfirmation })}
                                    styles={{ root: { padding: '10px 0 15px' } }}
                                />
                                <Stack  className={`collapsible-section${!this.state.showResetConfirmation ? ' hidden' : ''}`}>
                                <Text block>Type "yes" to confirm you would like to reset the portal. Click "Save" to submit.</Text>
                                    <TextField
                                        placeholder="Confirm by entering yes"
                                        description="Use lower-case when typing yes."
                                        value={this.state.resetConfirmation}
                                        onChange={(event, value) => this.setState({ resetConfirmation: value })}
                                        styles={{ root: { width: '100%', padding: '10px 0 5px' } }}
                                    />
                                </Stack>
                                {/* This will be added once link is provided */}
                                {/* <Link href="" target="_blank" styles={{ root: { paddingTop: 20 } }}>How do I remove the published version of the developer portal? <Icon iconName="OpenInNewWindow" styles={{ root: { paddingLeft: 5 } }} /></Link> */}
                            </Stack>
                        </PivotItem>
                    </Pivot>
                </div>
            </Modal>
        </>
    }
}