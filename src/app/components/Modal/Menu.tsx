import theme from 'app/styles/theme';
import React, { useState } from 'react';
import styled from 'styled-components';
import { SimpleButton } from '../Button';

const MenuContainer = styled.div<{ active?: boolean; }>`
    display: flex;
    border-bottom: 1px solid ${theme.colors.grey.light};
    justify-content: flex-end;
    margin-top: -25px;

    ${SimpleButton} {
        height: 40px;
        background-color: ${theme.colors.white};
        border-bottom: 3px solid transparent;
        margin-right: 16px;
        color: ${theme.colors.grey.dark};

        &.active {
            border-color: ${theme.colors.black};
            color: inherit;
        }

        &:hover:not(.active) {
            border-color: ${theme.colors.grey.medium};
            border-width: 1px;
            padding-bottom: 2px;
        }
    }
`;

type Props = {
    children: JSX.Element[] | JSX.Element;
    labels?: JSX.Element[] | string[];
}

function ModalMenu({ children, labels = [] }: Props): JSX.Element {
    const [selectedItem, setSelectedItem] = useState(0);

    return (
        <>
            <MenuContainer>
                {[...new Array(Array.isArray(children) ? children.length : 1)].map((a, i) =>
                    <SimpleButton key={i} onClick={() => setSelectedItem(i)} className={selectedItem === i ? 'active' : ''}>
                        {labels[i] || i}
                    </SimpleButton>
                )}
            </MenuContainer>
            <div>
                {Array.isArray(children) ? children[selectedItem] : children}
            </div>
        </>
    );
}

export default ModalMenu;