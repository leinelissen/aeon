import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import React, { useCallback } from 'react';
import styled, { css } from 'styled-components';

export const TextInput = styled.input`
    padding: 16px;
    border-radius: 4px;
    font-size: 16px;
    margin-bottom: 16px;

    background-color: var(--color-gray-50);
    border: 1px solid var(--color-border);
    color: inherit;

    &::placeholder {
        color: var(--color-gray-500);
    }
`;

export const Label = styled.label`
    font-size: 0.8em;
    display: flex;
    flex-direction: column;
    font-family: var(--font-mono);
    color: var(--color-gray-600);

    & > span {
        margin-left: 4px;
        margin-bottom: 2px;
    }
`;

const Select = styled.select<{ hasPlaceholder?: boolean }>`
    height: 50px;
    padding: 16px;
    border-radius: 4px;
    width: 100%;
    margin-bottom: 16px;

    background-color: var(--color-gray-50);
    border: 1px solid var(--color-border);

    color: inherit;
    appearance: none;

    ${(props) => props.hasPlaceholder && css`
        color: #00000066;
    `};

    &:disabled {
        background-color: var(--color-gray-300);
        color: var(--color-gray-700);
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
    options: string[] | Record<string, JSX.Element>;
    value: string;
    onSelect: (selectedValue: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

type Option = { key: string, value: unknown };

export function Dropdown(props: DropdownProps): JSX.Element {
    const { label, options, value, disabled, placeholder, onSelect } = props;

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
                <Select
                    value={value}
                    disabled={disabled}
                    onChange={handleChange}
                    placeholder="Please select an account"
                    // hasPlaceholder={value === ''}
                >
                    <option key="" disabled={value !== ''}>{placeholder || 'Please select an option'}</option>
                    {availableOptions.map((option) =>
                        <option key={option.key}>{option.value}</option>,    
                    )}
                </Select>
                <FontAwesomeIcon icon={faChevronDown} />
            </SelectContainer>
        </Label>
    );
}