import { Icon, IconName } from "@anoma/components";
import {
  AccountListingContainer,
  Address,
  Buttons,
  Details,
  Alias,
  DerivationPath,
  CopyToClipboard,
} from "./AccountListing.components";

import { DerivedAccount } from "background/keyring";

type Props = {
  account: DerivedAccount;
};

const textToClipboard = (content: string): void => {
  navigator.clipboard.writeText(content);
};

const AccountListing = ({ account }: Props): JSX.Element => {
  const { address, alias, bip44Path, establishedAddress } = account;
  const coinType = "0'";

  return (
    <AccountListingContainer>
      <Details>
        {alias && <Alias>{alias}</Alias>}
        <DerivationPath>
          m/44'/{coinType}/{`${bip44Path.account}'`}/{bip44Path.change}/
          {bip44Path.index}
        </DerivationPath>
        <Address>{address}</Address>
        {establishedAddress && <Address>{establishedAddress}</Address>}
      </Details>
      <Buttons>
        <CopyToClipboard
          onClick={() => {
            textToClipboard(address);
          }}
          href="#"
        >
          <Icon iconName={IconName.Copy} />
        </CopyToClipboard>
      </Buttons>
    </AccountListingContainer>
  );
};

export default AccountListing;
