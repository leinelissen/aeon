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
        margin-right: 16px;
        color: var(--color-gray-700);
        text-transform: capitalize;
        position: relative;

        &.active {
            color: var(--color-primary);
            font-weight: 600;
            letter-spacing: -0.35px;

            &::after {
                content: " ";
                background-color: var(--color-primary);
                color: inherit;
                position: absolute;
                bottom: 0;
                left: -4px;
                right: -4px;
                height: 3px;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
            }
        }

        &:hover:not(.active) {
            color: var(--color-gray-800);
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