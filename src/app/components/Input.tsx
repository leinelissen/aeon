import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from 'app/assets/fa-light';
import theme from 'app/styles/theme';
import React, { useCallback } from 'react';
import styled, { css } from 'styled-components';

export const TextInput = styled.input`
    padding: 16px;
    border-radius: 4px;
    font-size: 16px;
    margin-bottom: 16px;

    @media (prefers-color-scheme: dark) {
        background-color: #222222;
        border: 1px solid ${theme.colors.borderDarkMode};
        color: ${theme.colors.white};

        &::placeholder {
            color: #cccccc55;
        }
    }
    
    @media (prefers-color-scheme: light) {
        background-color: #fbfbfb;
        border: 1px solid ${theme.colors.border};

        &::placeholder {
            color: #33333355;
        }
    }

`;

export const Label = styled.label`
    font-size: 12px;
    display: flex;
    flex-direction: column;
    font-family: 'IBM Plex Mono';

    & > span {
        margin-left: 4px;
        margin-bottom: 2px;
    }

    @media (prefers-color-scheme: dark) {
        color: #cccccc55;
    }
    
    @media (prefers-color-scheme: light) {
        color: #33333355;
    }
`;

const Select = styled.select<{ hasPlaceholder?: boolean }>`
    height: 50px;
    padding: 16px;
    border-radius: 4px;
    border: 1px solid ${theme.colors.grey.medium};
    color: black;
    appearance: none;
    width: 100%;
    margin-bottom: 16px;

    ${props => props.hasPlaceholder && css`
        color: #00000066;
    `};

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
                    {availableOptions.map(option =>
                        <option key={option.key}>{option.value}</option>    
                    )}
                </Select>
                <FontAwesomeIcon icon={faChevronDown} />
            </SelectContainer>
        </Label>
    )
}