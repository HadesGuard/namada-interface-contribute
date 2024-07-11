import { toBase64 } from "@cosmjs/encoding";
import { TxType } from "@heliax/namada-sdk/web";
import {
  Chain,
  DerivedAccount,
  Namada as INamada,
  SignArbitraryProps,
  SignArbitraryResponse,
  SignProps,
  VerifyArbitraryProps,
  WasmHash,
  WasmHashProps,
} from "@namada/types";
import { MessageRequester, Ports } from "router";

import { AddTxWasmHashesMsg, GetTxWasmHashesMsg } from "background/chains";
import {
  ApproveConnectInterfaceMsg,
  ApproveSignArbitraryMsg,
  ApproveSignTxMsg,
  CheckDurabilityMsg,
  GetChainMsg,
  IsConnectionApprovedMsg,
  QueryAccountsMsg,
  QueryDefaultAccountMsg,
  VerifyArbitraryMsg,
} from "./messages";

export class Namada implements INamada {
  constructor(
    private readonly _version: string,
    protected readonly requester?: MessageRequester
  ) {}

  public async connect(): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new ApproveConnectInterfaceMsg()
    );
  }

  public async isConnected(): Promise<boolean> {
    if (!this.requester) {
      throw new Error("no requester");
    }

    return await this.requester.sendMessage(
      Ports.Background,
      new IsConnectionApprovedMsg()
    );
  }

  public async accounts(): Promise<DerivedAccount[] | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new QueryAccountsMsg()
    );
  }

  public async defaultAccount(): Promise<DerivedAccount | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new QueryDefaultAccountMsg()
    );
  }

  public async sign(props: SignProps): Promise<Uint8Array | undefined> {
    const {
      txType,
      signer,
      tx: { txBytes, signingDataBytes },
      wrapperTxMsg,
    } = props;
    return await this.requester?.sendMessage(
      Ports.Background,
      new ApproveSignTxMsg(
        txType as TxType,
        {
          txBytes: toBase64(txBytes),
          signingDataBytes: signingDataBytes.map((bytes) => toBase64(bytes)),
        },
        signer,
        toBase64(wrapperTxMsg)
      )
    );
  }

  public async signArbitrary(
    props: SignArbitraryProps
  ): Promise<SignArbitraryResponse | undefined> {
    const { signer, data } = props;
    return await this.requester?.sendMessage(
      Ports.Background,
      new ApproveSignArbitraryMsg(signer, data)
    );
  }

  public async verify(props: VerifyArbitraryProps): Promise<void> {
    const { publicKey, hash, signature } = props;
    return await this.requester?.sendMessage(
      Ports.Background,
      new VerifyArbitraryMsg(publicKey, hash, signature)
    );
  }

  public async getChain(): Promise<Chain | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new GetChainMsg()
    );
  }

  public async addTxWasmHashes({
    chainId,
    wasmHashes,
  }: WasmHashProps): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new AddTxWasmHashesMsg(chainId, wasmHashes)
    );
  }

  public async getTxWasmHashes(
    chainId: string
  ): Promise<WasmHash[] | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new GetTxWasmHashesMsg(chainId)
    );
  }

  public async checkDurability(): Promise<boolean | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new CheckDurabilityMsg()
    );
  }

  public version(): string {
    return this._version;
  }
}
