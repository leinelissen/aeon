import React from 'react';
import styled from 'styled-components';

const Provider = styled.div`
    width: 25px;
    height: 25px;
    border-radius: 25px;
    background-color: #0000FF;
    border: 4px solid #BAD7FF;
`;

const Account = styled.div`
    width: 25px;
    height: 25px;
    border-radius: 25px;
    background-color: #BAD7FF;
`;

const Type = styled.div`
    width: 25px;
    height: 25px;
    border-radius: 6px;
    background-color: #eee;
`;

const DataPoint = styled.div`
    width: 10px;
    height: 10px;
    border-radius: 10px;
    margin-left: 6.5px;
    margin-right: 6.5px;
    background-color: #eee;
`;

const Line = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    & > div {
        flex: 0 0 auto;
    }

    & > span {
        margin-left: 16px;
        line-height: 1.5;
    }
`;

function GraphExplainer (): JSX.Element {
    return (
        <div>
            <Line>
                <Provider />
                <span>The platform from which the data was accessed</span>
            </Line>
            <Line>
                <Account />
                <span>The account belonging to the data</span>
            </Line>
            <Line>
                <Type />
                <span>A type of data</span>
            </Line>
            <Line>
                <DataPoint />
                <span>A single data point</span>
            </Line>
        </div>
    );
}   

export default GraphExplainer;