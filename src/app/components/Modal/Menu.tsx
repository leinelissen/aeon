import theme from 'app/styles/theme';
import React, { useState } from 'react';
import styled from 'styled-components';
import { SimpleButton } from '../Button';

const MenuContainer = styled.div<{ active?: boolean; }>`
    display: flex;
    justify-content: flex-end;
    margin-top: -25px;

    @media (prefers-color-scheme: dark) {
        border-bottom: 1px solid ${theme.colors.borderDarkMode};
    }
    
    @media (prefers-color-scheme: light) {
        border-bottom: 1px solid ${theme.colors.border};
    }

    ${SimpleButton} {
        height: 40px;
        border-bottom: 2px solid transparent;
        margin-right: 16px;
        color: ${theme.colors.grey.dark};
        text-transform: capitalize;

        &.active {
            @media (prefers-color-scheme: dark) {
                border-color: ${theme.colors.white};
            }
            
            @media (prefers-color-scheme: light) {
                border-color: ${theme.colors.black};
            }
            color: inherit;
        }

        &:hover:not(.active) {
            border-color: ${theme.colors.grey.medium};
            border-width: 1px;
            padding-bottom: 2px;
        }

        &:first-child {
            margin-left: 40px;
        }
    }
`;

type Props = {
    children: JSX.Element[] | JSX.Element;
    labels?: JSX.Element[] | string[];
}

function ModalMenu({ children, labels = [], }: Props): JSX.Element {
    const [selectedItem, setSelectedItem] = useState(0);
    
    return (
        <>
            <MenuContainer data-tour="modal-menu-options">
                {[...new Array(Array.isArray(children) ? children.length : 1)].map((a, i) =>
                    <SimpleButton key={i} onClick={() => setSelectedItem(i)} className={selectedItem === i ? 'active' : ''}>
                        {labels[i] || i}
                    </SimpleButton>
                )}
            </MenuContainer>
            <div data-tour="modal-menu-container">
                {Array.isArray(children) ? children[selectedItem] : children}
            </div>
        </>
    );
}

export default ModalMenu;