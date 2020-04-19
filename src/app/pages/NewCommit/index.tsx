import React, { Component, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import Button, { GhostButton } from 'app/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCloudUpload, IconDefinition, faChevronRight } from '@fortawesome/pro-light-svg-icons';
import { H2 } from 'app/components/Typography';
import theme from 'app/styles/theme';
import { ProvidedDataTypes } from 'main/providers/types';
import DataType from 'app/utilities/DataType';

interface State {
    category?: ProvidedDataTypes;
}

const Container = styled.div`
    display: grid;
    grid-template-columns: 33% 67%;
    grid-template-rows: auto 1fr;
    height: calc(100vh - 40px);
`;

const TopBar = styled.div`
    display: flex;
    align-items: center;
    border-bottom: 1px solid ${theme.colors.border};
    padding: 16px 8px;
    grid-column: 1 / span 2;
`;

const List = styled.div`
    display: flex;
    flex-direction: column;
    border-right: 1px solid ${theme.colors.border};
    flex-grow: 1;
    overflow-y: scroll;
    position: relative;
`;

const ListItem = styled.div`
    padding: 8px 32px;
    flex-grow: 0;
    flex-shrink: 0;
`;

const RowHeading = styled(ListItem)`
    border-bottom: 1px solid ${theme.colors.border};
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.5);
    font-weight: 400;
    font-size: 12px;
    letter-spacing: 0.5px;
    position: sticky;
    top: 0;
    align-self: flex-start;
    background: white;
    z-index: 2;
    width: 100%;
`;

const SubHeading = styled(RowHeading)`
    font-size: 10px;
    color: rgba(0, 0, 0, 0.4);
`;

const ListButton = styled.button<{ active?: boolean }>`
    border: 0;
    background: transparent;
    display: flex;
    align-items: center;
    font-size: 14px;
    opacity: 0.7;
    margin: 0;
    padding: 14px 24px 14px 32px;
    font-weight: 400;

    ${props => props.active ? css`
        background: #eee;
        opacity: 0.9;
    ` : css`
        &:hover {
            background-color: #f8f8f8;
            opacity: 0.8;
        }
    `}
`;

interface ClickableItemProps {
    type: ProvidedDataTypes;
    onClick: (activity: ProvidedDataTypes) => void;
    active?: boolean;
}

const ClickableItem = ({ type, onClick, active }: ClickableItemProps): JSX.Element => {
    const handleClick = useCallback(() => {
        return onClick(type);
    }, [onClick, type]);

    return (
        <ListButton onClick={handleClick} active={active}>
            <FontAwesomeIcon icon={DataType.getIcon(type)} fixedWidth style={{ marginRight: 8 }} />
            {type}
            <FontAwesomeIcon icon={faChevronRight} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        </ListButton>
    );
};

class NewCommit extends Component<{}, State> {
    state: State = {
        category: null,
    }

    setCategory = (category: ProvidedDataTypes): void => this.setState({ category });

    render(): JSX.Element {
        const { category } = this.state;

        return (
            <Container>
                <TopBar>
                    <Link to="/log">
                        <GhostButton>
                            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 5 }} /> Back
                        </GhostButton>
                    </Link>
                    <H2>New Identity Update</H2>
                    <Button icon={faCloudUpload} style={{ marginLeft: 'auto' }}>
                        Save Identity
                    </Button>
                </TopBar>
                <List>
                    <RowHeading>CATEGORIES</RowHeading>
                    {Object.values(ProvidedDataTypes).map((key) => (
                        <ClickableItem
                            key={key}
                            type={key}
                            active={category === key}
                            onClick={this.setCategory}
                        />
                    ))}
                </List>
                <List>
                    <RowHeading>DATA POINTS</RowHeading>
                    <ListItem>{category}</ListItem>
                </List>
            </Container>
        );
    }
}

export default NewCommit;