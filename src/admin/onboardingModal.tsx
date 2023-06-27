import * as React from 'react';
import Carousel, { ControlProps } from 'nuka-carousel';
import { DefaultButton, IconButton, Image, ImageFit, Modal, PrimaryButton, Stack, Text } from '@fluentui/react';

interface OnboardingModalState {
    currentSlide: number
}

interface OnboardingModalProps {
    onDismiss: () => void
}

export class OnboardingModal extends React.Component<OnboardingModalProps, OnboardingModalState> {
    constructor(props: OnboardingModalProps) {
        super(props);

        this.state = {
            currentSlide: 0
        }
    }

    renderPrevButton = (props: ControlProps): JSX.Element => (
        <DefaultButton
            text="Previous"
            onClick={() => props.previousSlide()}
            styles={{ root: { display: props.previousDisabled ? 'none' : 'block' } }}
        />
    )
    
    renderNextButton = (props: ControlProps): JSX.Element => (
        <PrimaryButton
            text={props.currentSlide === 3 ? 'Close' : 'Next' }
            onClick={() => props.currentSlide === 3 ? this.props.onDismiss() : props.nextSlide()}
        />
    )

    render(): JSX.Element {
        return <>
            <Modal
                isOpen={true}
                containerClassName="admin-modal onboarding-modal"
            >
                <>
                    <IconButton
                        iconProps={{ iconName: 'Cancel', styles: { root: { color: '#ffffff' } } }}
                        aria-label="Close"
                        className="onboarding-modal-close"
                        onClick={this.props.onDismiss}
                    />
                    <Carousel
                        slideIndex={this.state.currentSlide}
                        enableKeyboardControls
                        defaultControlsConfig={{ pagingDotsClassName: 'carousel-dot', pagingDotsContainerClassName: 'carousel-dots-container' }}
                        renderCenterLeftControls={(props: ControlProps) => this.renderPrevButton(props)}
                        renderCenterRightControls={(props: ControlProps) => this.renderNextButton(props)}
                    >
                        <div>
                            <Image
                                src="/assets/images/nature.jpg"
                                imageFit={ImageFit.centerCover}
                                styles={{ root: { height: 360 } }}
                            />
                            <Stack className="carousel-text-container">
                                <Text block className="carousel-header">✨ Introducing the new enhanced Admin experience!</Text>
                                <Text block>We've reimagined the admin experience to make sure you get to the important stuff fast and can focus on what you need. Let's take a look!</Text>
                            </Stack>
                        </div>
                        <div>
                            <Image
                                src="/assets/images/nature.jpg"
                                imageFit={ImageFit.centerCover}
                                styles={{ root: { height: 360 } }}
                            />
                            <Stack className="carousel-text-container">
                                <Text block className="carousel-header">Streamlined Left Navigation</Text>
                                <Text block>We have redesigned the left navigation menu to make it even more intuitive and user-friendly. Finding your way around the admin interface is now easier than ever.</Text>
                            </Stack>
                        </div>
                        <div>
                            <Image
                                src="/assets/images/nature.jpg"
                                imageFit={ImageFit.centerCover}
                                styles={{ root: { height: 360 } }}
                            />
                            <Stack className="carousel-text-container">
                                <Text block className="carousel-header">Improved Layout Organization</Text>
                                <Text block>Layouts have been moved into dedicated pages, allowing for a more organized and structured admin experience. You'll find everything neatly categorized, enabling efficient management of your portal's design.</Text>
                            </Stack>
                        </div>
                        <div>
                            <Image
                                src="/assets/images/nature.jpg"
                                imageFit={ImageFit.centerCover}
                                styles={{ root: { height: 360 } }}
                            />
                            <Stack className="carousel-text-container">
                                <Text block className="carousel-header">Convenient Save and Publish</Text>
                                <Text block>We've made it simpler to save and publish your portal with just a single click. Look no further than the top toolbar to effortlessly update and share your changes.</Text>
                            </Stack>
                        </div>
                    </Carousel>
                </>
            </Modal>
        </>
    }
}