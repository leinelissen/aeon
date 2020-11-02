import theme from 'app/styles/theme';
import styled from 'styled-components';

export const ListItem = styled.div`
    padding: 8px 32px;
    flex-grow: 0;
    flex-shrink: 0;
`;

export const RowHeading = styled(ListItem)`
    border-bottom: 1px solid ${theme.colors.border};
    text-transform: uppercase;
    font-weight: 400;
    font-size: 12px;
    letter-spacing: 0.5px;
    position: sticky;
    top: 0;
    align-self: flex-start;
    z-index: 2;
    width: 100%;
    background-color: ${theme.colors.grey.light};
`;

export const SubHeading = styled(RowHeading)`
    font-size: 10px;
    color: ${theme.colors.grey.dark};
`;


export const PanelGrid = styled.div`
    display: grid;
    grid-auto-columns: auto;
    grid-template-columns: 1fr 1fr 1fr;
    padding-top: 40px;
    height: 100%;
    position: relative;
    overflow: hidden;
`;

export const List = styled.div`
    display: flex;
    flex-direction: column;
    border-right: 1px solid ${theme.colors.border};
    flex-grow: 1;
    overflow-y: auto;
    position: relative;
`;