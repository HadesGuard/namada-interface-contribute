import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  FETCH_VALIDATORS,
  FETCH_VALIDATOR_DETAILS,
  FETCH_MY_VALIDATORS,
  FETCH_MY_STAKING_POSITIONS,
  POST_NEW_STAKING,
  POST_UNSTAKING,
  Validator,
  ValidatorDetailsPayload,
  MyValidators,
  StakingPosition,
  ChangeInStakingPosition,
} from "./types";
import { myStakingData } from "./fakeData";
import { RootState } from "store";
import Config from "config";
import { Anoma } from "@anoma/integrations";
import { Abci, init as initShared } from "@anoma/shared";
import { RpcClient, RpcConfig, SocketClient } from "@anoma/rpc";
import { fetchWasmCode } from "@anoma/utils";
import { Tokens, TxWasm } from "@anoma/tx";
import { SignedTx } from "@anoma/types";

const toValidator = ([address, votingPower]: [string, string]): Validator => ({
  uuid: address,
  name: address,
  // TODO: voting power is multiplied by votes_per_token value defined in genesis file
  // currently it is 10
  votingPower: `NAM ${BigInt(votingPower) * BigInt(10)}`,
  homepageUrl: "http://namada.net",
  commission: "TBD",
  description: "TBD",
});

const toMyValidator = ([address, bonded]: [string, string]): MyValidators => ({
  uuid: address,
  stakingStatus: "Bonded",
  stakedAmount: bonded,
  validator: toValidator([address, bonded]),
});

const toStakingPosition = ([address, stakedAmount]: [
  string,
  string
]): StakingPosition => ({
  uuid: address,
  stakingStatus: "Bonded",
  stakedAmount: stakedAmount,
  stakedCurrency: "NAM",
  totalRewards: "TBD",
  validatorId: address,
});
// this retrieves the validators
// this dispatches further actions that are depending on
// validators data
export const fetchValidators = createAsyncThunk<
  { allValidators: Validator[] },
  void,
  { state: RootState }
>(FETCH_VALIDATORS, async (_, thunkApi) => {
  const { chainId } = thunkApi.getState().settings;
  const { network } = Config.chain[chainId];

  await initShared();
  const abci = new Abci(`http://${network.url}`);
  const allValidators = (await abci.query_all_validators()).map(toValidator);

  thunkApi.dispatch(fetchMyValidators(allValidators));
  return Promise.resolve({ allValidators });
});

export const fetchValidatorDetails = createAsyncThunk<
  ValidatorDetailsPayload | undefined,
  string
>(FETCH_VALIDATOR_DETAILS, async (validatorId: string) => {
  try {
    return Promise.resolve({
      name: validatorId,
    });
  } catch {
    return Promise.reject();
  }
});

// fetches staking data and appends the validators to it
// this needs the validators, so they are being passed in
// vs. getting them from the state
//
// TODO this or fetchMyStakingPositions is likely redundant based on
// real data model stored in the chain, adjust when implementing the real data
export const fetchMyValidators = createAsyncThunk<
  { myValidators: MyValidators[]; myStakingPositions: StakingPosition[] },
  Validator[],
  { state: RootState }
>(FETCH_MY_VALIDATORS, async (_, thunkApi) => {
  try {
    const { chainId } = thunkApi.getState().settings;
    const { network } = Config.chain[chainId];

    const anoma = new Anoma();
    // TODO: read from state after extension is integrated with interface
    const accounts = (await anoma.signer(chainId).accounts()) || [];

    await initShared();
    const abci = new Abci(`http://${network.url}`);
    const myValidatorsRes = await abci.query_my_validators(accounts[0].address);

    const myValidators = myValidatorsRes.map(toMyValidator);
    const myStakingPositions = myValidatorsRes.map(toStakingPosition);

    return Promise.resolve({ myValidators, myStakingPositions });
  } catch (error) {
    console.warn(`error: ${error}`);
    return Promise.reject({});
  }
});

const createBondingTx = async (
  txWasm: TxWasm,
  change: ChangeInStakingPosition,
  epoch: number,
  chainId: string
): Promise<SignedTx> => {
  const txCode = await fetchWasmCode(txWasm);
  const anoma = new Anoma();
  const signer = anoma.signer(chainId);

  // TODO: read from state after extension is integrated with interface
  const accounts = (await anoma.signer(chainId).accounts()) || [];
  const source = accounts[0].address;

  const encodedTx =
    (await signer.encodeBonding({
      source,
      validator: change.validatorId,
      // TODO: change amount to number
      amount: Number(change.amount) * 1_000_000,
    })) || "";

  return (
    (await signer.signTx(
      source,
      {
        token: Tokens["NAM"].address!,
        epoch,
        feeAmount: 0,
        gasLimit: 0,
        txCode,
      },
      encodedTx
    )) || { hash: "", bytes: "" }
  );
};

export const fetchMyStakingPositions = createAsyncThunk<
  { myStakingPositions: StakingPosition[] },
  void
>(FETCH_MY_STAKING_POSITIONS, async () => {
  return Promise.resolve({ myStakingPositions: myStakingData });
});

// we generate the new staking transaction
// we post the new staking transaction
// once it is accepted to the chain, we dispatch the below actions to get
// the new updated balances and validator amounts:
// * fetchMyBalances
// * fetchMyValidators
export const postNewBonding = createAsyncThunk<
  void,
  ChangeInStakingPosition,
  { state: RootState }
>(POST_NEW_STAKING, async (change, thunkApi) => {
  const { chainId } = thunkApi.getState().settings;
  const chainConfig = Config.chain[chainId];
  const {
    network: { url, port, protocol, wsProtocol },
    network,
  } = chainConfig;
  const rpcClient = new RpcClient(network);
  const rpcConfig = new RpcConfig(url, port, protocol, wsProtocol);
  const socketClient = new SocketClient(rpcConfig.wsNetwork);

  const epoch = await rpcClient.queryEpoch();

  const { hash, bytes } = await createBondingTx(
    TxWasm.Bond,
    change,
    epoch,
    chainId
  );

  if (hash && bytes) {
    await socketClient.broadcastTx(bytes);
  } else {
    throw new Error("Invalid transaction!");
  }

  return Promise.resolve();
});

// we post an unstake transaction
// once it is accepted to the chain, we dispatch the below actions to get
// the new updated balances and validator amounts:
// * fetchMyBalances
// * fetchMyValidators
export const postNewUnbonding = createAsyncThunk<
  void,
  ChangeInStakingPosition,
  { state: RootState }
>(POST_UNSTAKING, async (change, thunkApi) => {
  const { chainId } = thunkApi.getState().settings;
  const chainConfig = Config.chain[chainId];
  const {
    network: { url, port, protocol, wsProtocol },
    network,
  } = chainConfig;
  const rpcClient = new RpcClient(network);
  const rpcConfig = new RpcConfig(url, port, protocol, wsProtocol);
  const socketClient = new SocketClient(rpcConfig.wsNetwork);

  const epoch = await rpcClient.queryEpoch();

  const { hash, bytes } = await createBondingTx(
    TxWasm.UnBond,
    change,
    epoch,
    chainId
  );

  if (hash && bytes) {
    await socketClient.broadcastTx(bytes);
  } else {
    throw new Error("Invalid transaction!");
  }

  return Promise.resolve();
});
