import styled from 'styled-components';

export const TextInput = styled.input`
    border: 1px solid #eee;
    background-color: #fbfbfb;
    padding: 16px;
    border-radius: 4px;
    font-size: 16px;

    &::placeholder {
        color: #33333355;
    }
`;

export const Label = styled.label`
    font-size: 12px;
    display: flex;
    flex-direction: column;
    color: #33333355;
`;