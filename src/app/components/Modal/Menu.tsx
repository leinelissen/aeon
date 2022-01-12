import React, { useState } from 'react';
import styled from 'styled-components';
import { SimpleButton } from '../Button';

const MenuContainer = styled.div<{ active?: boolean; }>`
    display: flex;
    justify-content: flex-end;
    margin-top: -25px;
    border-bottom: 1px solid var(--color-border);

    ${SimpleButton} {
        height: 40px;
        border-bottom: 2px solid transparent;
        margin-right: 16px;
        color: var(--color-gray-700);
        text-transform: capitalize;

        &.active {
            border-color: var(--color-text);
            color: inherit;
        }

        &:hover:not(.active) {
            border-color: var(--color-gray-500);
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
};

function ModalMenu({ children, labels = [] }: Props): JSX.Element {
    const [selectedItem, setSelectedItem] = useState(0);
    
    return (
        <>
            <MenuContainer data-tour="modal-menu-options">
                {[...new Array(Array.isArray(children) ? children.length : 1)].map((a, i) =>
                    <SimpleButton key={i} onClick={() => setSelectedItem(i)} className={selectedItem === i ? 'active' : ''}>
                        {labels[i] || i}
                    </SimpleButton>,
                )}
            </MenuContainer>
            <div data-tour="modal-menu-container">
                {Array.isArray(children) ? children[selectedItem] : children}
            </div>
        </>
    );
}

export default ModalMenu;