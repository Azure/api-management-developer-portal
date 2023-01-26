import * as React from 'react';

const SidePanel = () => {
    return (
        <div className='side-panel'>
            <div className='portal-name'>mydevportal</div>
            <div className='navigation'>
                <div className='nav-item'>Pages</div>
                <div className='nav-item'>Styles</div>
                <div className='nav-item'>Navigation</div>
                <div className='nav-item'>Settings</div>
                <div className='nav-item'>Help</div>
            </div>
        </div>
    );
}

export default SidePanel;
