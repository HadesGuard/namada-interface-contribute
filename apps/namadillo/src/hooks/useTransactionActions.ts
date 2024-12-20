import { defaultAccountAtom } from "atoms/accounts";
import {
  myTransactionHistoryAtom,
  transactionHistoryAtom,
} from "atoms/transactions/atoms";
import { useAtomValue, useSetAtom } from "jotai";
import { TransferTransactionData } from "types";

type UseTransactionActionsOutput = {
  transactions: TransferTransactionData[];
  findByHash: (hash: string) => TransferTransactionData | undefined;
  storeTransaction: (tx: TransferTransactionData) => void;
  clearMyCompleteTransactions: () => void;
  changeTransaction: (
    hash: string,
    updatedTx: Partial<TransferTransactionData>
  ) => void;
};

export const useTransactionActions = (): UseTransactionActionsOutput => {
  const { data: account } = useAtomValue(defaultAccountAtom);
  const setTransactions = useSetAtom(transactionHistoryAtom);
  const transactions = useAtomValue(myTransactionHistoryAtom);

  const storeTransaction = (tx: TransferTransactionData): void => {
    setTransactions((txs) => {
      if (!account) return txs;
      const obj = txs[account.address] || [];
      return {
        ...txs,
        [account.address]: [...obj, { ...tx }],
      };
    });
  };

  const changeTransaction = (
    hash: string,
    updatedTx: Partial<TransferTransactionData>
  ): void => {
    setTransactions((txByAccount) => {
      if (!account) return txByAccount;

      const txs = txByAccount[account.address] || [];
      if (!txs) return txByAccount;

      return {
        ...txByAccount,
        [account.address]: txs.map((tx) =>
          tx.hash === hash ?
            ({ ...tx, ...updatedTx } as TransferTransactionData)
          : tx
        ),
      };
    });
  };

  const findByHash = (hash: string): undefined | TransferTransactionData => {
    return transactions.find((t) => t.hash === hash);
  };

  const clearMyCompleteTransactions = (): void => {
    if (!account) return;
    setTransactions((txs) => {
      return {
        ...txs,
        [account.address]: txs[account.address].filter(
          (tx) => tx.status === "pending" || tx.status === "idle"
        ),
      };
    });
  };

  return {
    transactions,
    findByHash,
    storeTransaction,
    changeTransaction,
    clearMyCompleteTransactions,
  };
};
