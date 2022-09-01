import { createAsyncThunk, createAction } from "@reduxjs/toolkit";
import {
  ADD_ACCOUNT_TO_LEDGER,
  UPDATE_SHIELDED_BALANCES,
  NewAccountDetails,
  ShieldedAccount,
  AccountErrors,
} from "./types";
import { history, TopLevelRouteGenerator } from "App";
import { RootState } from "store/store";
import { Session } from "@anoma/session";
import {
  getShieldedBalance,
  TRANSFER_CONFIGURATION,
} from "slices/shieldedTransfer";
import { ShieldedAccountType, getMaspWeb } from "@anoma/masp-web";

type NewAccountDetailsWithPassword = NewAccountDetails & {
  chainId: string;
  password: string;
};

type ShieldedKeysAndAddressesWithNewAccountDetails = {
  chainId: string;
  shieldedKeysAndAddress: ShieldedAccount;
  newAccountDetails: NewAccountDetails;
};

/**
 * Creates "shielded accounts" (viewing key, spending key, payment address)
 * after a successful creation navigates to TopLevelRouteGenerator.createRouteForWallet()
 * TODO take the followup action such as navigation as a parameter
 * or at least allow overriding the default
 */
export const createShieldedAccount = createAsyncThunk<
  ShieldedKeysAndAddressesWithNewAccountDetails | undefined,
  NewAccountDetailsWithPassword
>(
  ADD_ACCOUNT_TO_LEDGER,
  async (newAccountDetails: NewAccountDetailsWithPassword) => {
    try {
      // TODO distinguish between master/derived
      const { chainId, alias, password } = newAccountDetails;
      const mnemonic = await Session.getSeed(password);

      if (mnemonic) {
        const initialisedMaspWeb = await getMaspWeb();
        const shieldedAccountWithRustFields =
          initialisedMaspWeb.createShieldedMasterAccount(
            alias,
            mnemonic
          ) as ShieldedAccountType;

        const shieldedAccount = {
          viewingKey: shieldedAccountWithRustFields.viewing_key,
          spendingKey: shieldedAccountWithRustFields.spending_key,
          paymentAddress: shieldedAccountWithRustFields.payment_address,
        };

        const payload: ShieldedKeysAndAddressesWithNewAccountDetails = {
          chainId,
          newAccountDetails,
          shieldedKeysAndAddress: shieldedAccount,
        };

        // TODO allow overriding this
        history.push(TopLevelRouteGenerator.createRouteForWallet());
        return payload;
      }
      Promise.reject("could not create seed phrase");
    } catch (error) {
      Promise.reject(error);
    }
  }
);

export type ShieldedBalancesPayload = {
  chainId: string;
  shieldedBalances: {
    [accountId: string]: number | AccountErrors;
  };
};

export const updateShieldedBalances = createAsyncThunk<
  ShieldedBalancesPayload,
  void
>(UPDATE_SHIELDED_BALANCES, async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as RootState;
    const { chainId } = state.settings;
    const shieldedAccounts = state.accounts.shieldedAccounts[chainId];
    const shieldedBalances: ShieldedBalancesPayload = {
      chainId,
      shieldedBalances: {},
    };

    for (const shieldedAccountId of Object.keys(shieldedAccounts)) {
      const shieldedAccount = shieldedAccounts[shieldedAccountId];
      const { tokenType } = shieldedAccount;
      const tokenAddress = TRANSFER_CONFIGURATION.tokenAddresses[tokenType];
      const shieldedBalance = await getShieldedBalance(
        chainId,
        shieldedAccount.shieldedKeysAndPaymentAddress.spendingKey,
        tokenAddress
      );

      // TODO, move the casting with errors to a common place
      // we attempt to cast the balance to number
      const shieldedBalanceAsNumber = Number(shieldedBalance);
      // if the casting failed, we reassign the return value
      if (
        typeof shieldedBalanceAsNumber === "number" &&
        isNaN(shieldedBalanceAsNumber)
      ) {
        shieldedBalances.shieldedBalances[shieldedAccountId] =
          AccountErrors.NonNumericShieldedBalanceReturned;
      } else {
        shieldedBalances.shieldedBalances[shieldedAccountId] =
          shieldedBalanceAsNumber;
      }
    }
    return Promise.resolve(shieldedBalances);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      AccountErrors.RetrievingShieldedBalancesFailed
    );
  }
});

export const reset = createAction("reset");
