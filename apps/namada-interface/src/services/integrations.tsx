import { chains } from "@anoma/chains";
import { Anoma, Keplr } from "@anoma/integrations";
import { createContext, useCallback, useContext, useState } from "react";

type Integration = typeof Anoma | typeof Keplr;
type ChainId = string;
type IntegrationsMap = Record<string, Integration>;
type Integrations = Record<ChainId, InstanceType<Integration>>;
type ExtensionConnection<T, U> = (
  onSuccess: () => T,
  onFail?: () => U
) => Promise<void>;

const extensionMap: IntegrationsMap = {
  anoma: Anoma,
  keplr: Keplr,
};

const integrations = Object.entries(chains).reduce((acc, [chainId, chain]) => {
  const extensionId = chain.extension.id;

  if (Object.keys(extensionMap).includes(extensionId)) {
    const Ext = extensionMap[extensionId];
    acc[chainId] = new Ext(chain);
  }

  return acc;
}, {} as Integrations);

export const IntegrationsContext = createContext<Integrations>({});

export const IntegrationsProvider: React.FC = (props): JSX.Element => {
  return (
    <IntegrationsContext.Provider value={integrations}>
      {props.children}
    </IntegrationsContext.Provider>
  );
};

/**
 * Hook for accessing integration by ChainId.
 *
 * @param {ChainId} chainId - Id of the chain as a string.
 * @returns {InstanceType<Integration>} Integration API
 */
export const useIntegration = (chainId: ChainId): InstanceType<Integration> => {
  return useContext(IntegrationsContext)[chainId];
};

/**
 * Hook for running functions with integration connection.
 *
 * @template TSuccess - Success return type.
 * @template TFail - Fail return type.
 * @param {string} chainId - Id of a chain
 * @returns {[InstanceType<Integration>, boolean, ExtensionConnection<TSuccess, TFail>]}
 * Tuple of integration, connection status and connection function.
 */
export const useIntegrationConnection = <TSuccess, TFail>(
  chainId: string
): [
  InstanceType<Integration>,
  boolean,
  ExtensionConnection<TSuccess, TFail>
] => {
  const integration = useIntegration(chainId);
  const [isConnectingToExtension, setIsConnectingToExtension] = useState(false);

  const connect: ExtensionConnection<TSuccess, TFail> = useCallback(
    async (onSuccess, onFail) => {
      setIsConnectingToExtension(true);
      try {
        if (integration?.detect()) {
          await integration?.connect();
          await onSuccess();
        }
      } catch (e) {
        if (onFail) {
          await onFail();
        }
      }
      setIsConnectingToExtension(false);
    },
    []
  );

  return [integration, isConnectingToExtension, connect];
};

/**
 * Returns integrations map. To be used outside react components.
 *
 * @returns {[Integrations]} Map of chainId -> Integration.
 */
export const getIntegrations = (): Integrations => {
  return integrations;
};

/**
 * Returns integration by chainId. To be used outside react components.
 *
 * @param {ChainId} chainId - Id of the chain as a string.
 * @returns {InstanceType<Integration>} Integration API
 */
export const getIntegration = (chainId: ChainId): InstanceType<Integration> => {
  return integrations[chainId];
};
