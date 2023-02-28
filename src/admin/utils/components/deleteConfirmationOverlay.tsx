import * as React from 'react';
import { Stack, Layer, Overlay, Popup, mergeStyleSets, DefaultButton, FocusTrapZone, PrimaryButton } from '@fluentui/react';

const popupStyles = mergeStyleSets({
    root: {
        background: 'rgba(0, 0, 0, 0.2)',
        bottom: '0',
        left: '0',
        position: 'fixed',
        right: '0',
        top: '0',
    },
    content: {
        background: 'white',
        left: '50%',
        maxWidth: '400px',
        padding: '1em 2em 2em',
        position: 'absolute',
        top: '50%',
        transform: 'translate(-50%, -50%)',
    },
});

interface DeleteConfirmationProps {
    deleteItemTitle: string,
    onDelete: () => void,
    closeDeleteConfirmation: () => void
}

export class DeleteConfirmationOverlay extends React.Component<DeleteConfirmationProps, {}> {
    constructor(props: DeleteConfirmationProps) {
        super(props);
    }

    render() {
        return <>
            <Layer>
                <Popup
                    className={popupStyles.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={this.props.closeDeleteConfirmation}
                    enableAriaHiddenSiblings={true}
                >
                    <Overlay onClick={this.props.closeDeleteConfirmation} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles.content}>
                            <p>Are you sure you want to delete {this.props.deleteItemTitle}?</p>
                            <Stack horizontal tokens={{ childrenGap: 20 }}>
                                <PrimaryButton onClick={this.props.onDelete}>Yes</PrimaryButton>
                                <DefaultButton onClick={this.props.closeDeleteConfirmation}>No</DefaultButton>
                            </Stack>
                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        </>
    };
}