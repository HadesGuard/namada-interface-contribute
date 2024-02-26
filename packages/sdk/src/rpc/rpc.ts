import {
  Query as QueryWasm,
  Sdk as SdkWasm,
  TransferToEthereum,
} from "@namada/shared";
import { SignedTx } from "tx/types";

import { deserialize } from "@dao-xyz/borsh";
import { Proposal, Proposals } from "@namada/shared/src/borsh-schemas";
import {
  Balance,
  BondsResponse,
  DelegationTotals,
  DelegatorsVotes,
  GasCosts,
  StakingPositions,
  StakingTotals,
  StakingTotalsResponse,
  UnbondsResponse,
} from "rpc/types";

/**
 * API for executing RPC requests with Namada
 */
export class Rpc {
  /**
   * @param {SdkWasm} sdk - Instance of Sdk struct from wasm lib
   * @param {QueryWasm} query - Instance of Query struct from wasm lib
   */
  constructor(
    protected readonly sdk: SdkWasm,
    protected readonly query: QueryWasm
  ) {}

  /**
   * Query balances from chain
   * @async
   * @param {string} owner - Owner address
   * @param {string[]} tokens - Array of token addresses
   * @returns {Balance} [[tokenAddress, amount]]
   */
  async queryBalance(owner: string, tokens: string[]): Promise<Balance> {
    return await this.query.query_balance(owner, tokens);
  }

  /**
   * Query native token from chain
   * @async
   * @returns {string} Address of native token
   */
  async queryNativeToken(): Promise<string> {
    return await this.query.query_native_token();
  }

  /**
   * Query public key
   * Return string of public key if it has been revealed on chain, otherwise, return null
   * @async
   * @param {string} address
   * @returns {string|null} String of public key if found
   */
  async queryPublicKey(address: string): Promise<string | null> {
    const pk = await this.query.query_public_key(address);
    return pk || null;
  }

  /**
   * Query all validator addresses
   * @async
   * @returns {string[]} Array of all validator addresses
   */
  async queryAllValidators(): Promise<string[]> {
    return await this.query.query_all_validator_addresses();
  }

  /**
   * Query Proposals
   * @async
   * @returns {Proposal[]}
   */
  async queryProposals(): Promise<Proposal[]> {
    const serializedProposals = await this.query.query_proposals();
    const { proposals } = deserialize(serializedProposals, Proposals);
    return proposals;
  }

  /**
   * Query total delegations
   * @async
   * @param {string[]} owners - Array of owner addresses
   * @param {bigint} [epoch]
   */
  async queryTotalDelegations(
    owners: string[],
    epoch?: bigint
  ): Promise<DelegationTotals> {
    return await this.query.get_total_delegations(owners, epoch);
  }

  /**
   * Query delegators votes
   * @async
   * @param {bigint} proposalId
   */
  async queryDelegatorsVotes(proposalId: bigint): Promise<DelegatorsVotes> {
    return await this.query.delegators_votes(proposalId);
  }

  /**
   * Query staking totals by owner addresses
   * @async
   * @param {string[]} owners - Array of owner addresses
   * @returns {StakingTotals[]}
   */
  async queryStakingTotals(owners: string[]): Promise<StakingTotals[]> {
    const stakingAmounts = await this.query.query_my_validators(owners);
    return stakingAmounts.map(
      ([
        owner,
        validator,
        bonds,
        unbonds,
        withdrawable,
      ]: StakingTotalsResponse) => {
        return {
          owner,
          validator,
          bonds,
          unbonds,
          withdrawable,
        };
      }
    );
  }

  /**
   * Query bond and unbond details by owner addresses
   * @async
   * @param {string[]} owners - Array of owner addresses
   * @returns {StakingPositions}
   */
  async queryStakingPositions(owners: string[]): Promise<StakingPositions> {
    const [bonds, unbonds] = await this.query.query_staking_positions(owners);
    return {
      bonds: bonds.map(
        ([owner, validator, amount, startEpoch]: BondsResponse) => ({
          owner,
          validator,
          amount,
          startEpoch,
        })
      ),
      unbonds: unbonds.map(
        ([
          owner,
          validator,
          amount,
          startEpoch,
          withdrawableEpoch,
        ]: UnbondsResponse) => ({
          owner,
          validator,
          amount,
          startEpoch,
          withdrawableEpoch,
        })
      ),
    };
  }

  /**
   * Query total bonds by owner address
   * @param {string} owner - Owner address
   * @returns {number}
   */
  async queryTotalBonds(owner: string): Promise<number> {
    return await this.query.query_total_bonds(owner);
  }

  /**
   * Query pending transactions in the signed bridge pool
   * @async
   * @param {string[]} owners - Array of owner addresses
   * @returns {TransferToEthereum[]}
   */
  async querySignedBridgePool(owners: string[]): Promise<TransferToEthereum[]> {
    return await this.query.query_signed_bridge_pool(owners);
  }

  /**
   * Query gas costs
   * @returns {GasCosts[]}
   */
  async queryGasCosts(): Promise<GasCosts> {
    return await this.query.query_gas_costs();
  }

  /**
   * Broadcast a Tx to the ledger
   * @async
   * @param {SignedTx} signedTx - Transaction with signature
   * @returns {void}
   */
  async broadcastTx(signedTx: SignedTx): Promise<void> {
    const { txMsg, tx } = signedTx;
    await this.sdk.process_tx(tx, txMsg);
  }
}
