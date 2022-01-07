import React from 'react';
import { InfoWell } from 'app/components/Well';
import styled from 'styled-components';
import { useAppSelector } from 'app/store';
import Providers from 'app/utilities/Providers';
import { TabContainer, TabItem } from 'app/components/TabNavigator';
import { RouteProps } from '../types';
import { useParams } from 'react-router-dom';

const Container = styled.div`
    padding: 2em;
`;

function ParserInspector(): JSX.Element {
    const providers = useAppSelector((state) => state.accounts.allProviders);
    const { provider } = useParams<RouteProps['parser-inspector']>();

    return (
        <>
            <Container>
                <InfoWell>
                    This inspector contains undocumented and unmaintained features. Continue at your own risk.
                </InfoWell>
            </Container>
            <TabContainer>
                {providers.map((provider) => (
                    <TabItem
                        to={`/parser-inspector/${provider}`}
                        key={provider}
                        icon={Providers.getIcon(provider)}
                    >
                        {provider}
                    </TabItem>
                ))}
            </TabContainer>
            <Container>
                {provider}
            </Container>
        </>
    );
}

export default ParserInspector;