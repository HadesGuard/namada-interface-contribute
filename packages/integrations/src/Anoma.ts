import {
  Account,
  Anoma as IAnoma,
  Chain,
  Signer,
  Tokens,
  TokenType,
  TokenBalance,
  WindowWithAnoma,
} from "@anoma/types";

import { BridgeProps, Integration } from "./types/Integration";

export default class Anoma implements Integration<Account, Signer> {
  private _anoma: WindowWithAnoma["anoma"] | undefined;

  constructor(public readonly chain: Chain) {}

  public get instance(): IAnoma | undefined {
    return this._anoma;
  }

  private _init(): void {
    if (!this._anoma) {
      this._anoma = (<WindowWithAnoma>window)?.anoma;
    }
  }

  public detect(): boolean {
    this._init();
    return !!this._anoma;
  }

  public async connect(): Promise<void> {
    this._init();
    await this._anoma?.connect(this.chain.chainId);
  }

  public async accounts(): Promise<readonly Account[] | undefined> {
    await this.connect();
    const signer = this._anoma?.getSigner(this.chain.chainId);
    return await signer?.accounts();
  }

  public signer(): Signer | undefined {
    return this._anoma?.getSigner(this.chain.chainId);
  }

  public async submitBridgeTransfer(props: BridgeProps): Promise<void> {
    if (props.ibcProps) {
      const { source, receiver, channelId, portId, amount, token } =
        props.ibcProps;
      const tokenAddress = Tokens[token as TokenType]?.address;
      const signer = this._anoma?.getSigner(this.chain.chainId);

      return await signer?.submitIbcTransfer({
        tx: {
          chainId: this.chain.chainId,
          token: Tokens.NAM.address || "",
          feeAmount: 0,
          gasLimit: 0,
        },
        source,
        receiver,
        channelId,
        portId,
        token: tokenAddress || "",
        amount,
      });
    } else if (props.bridgeProps) {
      console.log("TODO: Implement Ethereum Bridge transfer");
      return;
    }

    return Promise.reject("Invalid bridge transfer props!");
  }

  public async queryBalances(owner: string): Promise<TokenBalance[]> {
    const balance = (await this._anoma?.balances(owner)) || [];
    const tokenBalances = Object.keys(Tokens).map((tokenType: string) => {
      const { address: tokenAddress = "" } = Tokens[tokenType as TokenType];
      const amount =
        balance.find(({ token }) => token === tokenAddress)?.amount || 0;

      return {
        token: tokenType as TokenType,
        // TODO: Implement balance fetching via SDK
        amount,
      };
    });

    return tokenBalances;
  }
}
