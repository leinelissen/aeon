import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from 'app/assets/fa-light';
import theme from 'app/styles/theme';
import React, { useCallback } from 'react';
import styled from 'styled-components';

export const TextInput = styled.input`
    border: 1px solid #eee;
    background-color: #fbfbfb;
    padding: 16px;
    border-radius: 4px;
    font-size: 16px;
    margin-bottom: 16px;

    &::placeholder {
        color: #33333355;
    }
`;

export const Label = styled.label`
    font-size: 12px;
    display: flex;
    flex-direction: column;
    color: #33333355;
    font-family: 'IBM Plex Mono';

    & > span {
        margin-left: 4px;
        margin-bottom: 2px;
    }
`;

const Select = styled.select`
    height: 50px;
    padding: 16px;
    border-radius: 4px;
    border: 1px solid ${theme.colors.grey.medium};
    color: black;
    appearance: none;
    width: 100%;
    margin-bottom: 16px;

    &:disabled {
        background-color: ${theme.colors.grey.medium};
        color: ${theme.colors.grey.dark};
        cursor: not-allowed;
    }
`;

const SelectContainer = styled.div`
    position: relative;

    svg {
        position: absolute;
        right: 16px;
        top: calc(50% - 8px);
        transform: translateY(-50%);
    }
`;

interface DropdownProps {
    label: string;
    options: string[] | JSX.Element[] | Record<string, JSX.Element>;
    value: string;
    onSelect: (selectedValue: string) => void;
    disabled?: boolean;
}

type Option = { key: string, value: unknown };

export function Dropdown(props: DropdownProps): JSX.Element {
    const { label, options, value, disabled, onSelect } = props;

    const availableOptions: Option[] = Array.isArray(options)
        ? options.map<Option>((o) => ({ key: o, value: o }))
        : Object.keys(options).map((key) => ({ key, value: options[key] }));

    const handleChange = useCallback((event) => {
        onSelect(event.target.value);
    }, [onSelect]);

    return (
        <Label>
            <span>{label}</span>
            <SelectContainer>
                <Select value={value} disabled={disabled} onChange={handleChange}>
                    {availableOptions.map(option =>
                        <option key={option.key}>{option.value}</option>    
                    )}
                </Select>
                <FontAwesomeIcon icon={faChevronDown} />
            </SelectContainer>
        </Label>
    )
}