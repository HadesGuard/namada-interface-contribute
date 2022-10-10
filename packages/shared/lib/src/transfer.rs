use crate::types::transaction::Transaction;
use namada::types::{address::Address, token};
use borsh::BorshSerialize;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use gloo_utils::format::JsValueSerdeExt;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Transfer {
    token: Address,
    tx_data: Vec<u8>,
}

#[wasm_bindgen]
impl Transfer {
    #[wasm_bindgen(constructor)]
    pub fn new(
        source: String,
        target: String,
        token: String,
        amount: f32,
    ) -> Self {
        let source = Address::from_str(&source).expect("Address from string should not fail");
        let target = Address::from_str(&target).expect("Address from string should not fail");
        let token = Address::from_str(&token).expect("Address from string should not fail");
        let amount = token::Amount::from(amount as u64);

        let transfer = token::Transfer {
            source,
            target,
            token: token.clone(),
            amount,
        };

        let tx_data = transfer
            .try_to_vec()
            .expect("Encoding unsigned transfer shouldn't fail");

        Self {
            token,
            tx_data,
        }
    }

    pub fn to_tx(
        &self,
        secret: &str,
        epoch: u32,
        fee_amount: u32,
        gas_limit: u32,
        tx_code: Vec<u8>,
    ) -> Result<JsValue, JsValue> {
        let tx_data: &[u8] = &self.tx_data;
        let tx_code: &[u8] = &tx_code;
        let token = self.token.clone();
        let transaction =
            match Transaction::new(secret, token, epoch, fee_amount, gas_limit, tx_code, tx_data) {
                Ok(transaction) => transaction,
                Err(error) => return Err(error),
            };

        // Return serialized Transaction
        Ok(JsValue::from_serde(&transaction.serialize()).unwrap())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::transaction::SerializedTx;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn can_generate_transfer_transaction() {
        let source = String::from("atest1v4ehgw368ycryv2z8qcnxv3cxgmrgvjpxs6yg333gym5vv2zxepnj334g4rryvj9xucrgve4x3xvr4");
        let target = String::from("atest1v4ehgw36xvcyyvejgvenxs34g3zygv3jxqunjd6rxyeyys3sxy6rwvfkx4qnj33hg9qnvse4lsfctw");
        let secret = String::from("1498b5467a63dffa2dc9d9e069caf075d16fc33fdd4c3b01bfadae6433767d93");
        let token = String::from("atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5");
        let amount = 1000.0;
        let epoch = 5;
        let fee_amount = 1000;
        let gas_limit = 1_000_000;

        let tx_code = vec![];

        let transfer = Transfer::new(source, target, token, amount);
        let transaction = transfer.to_tx(&secret, epoch, fee_amount, gas_limit, tx_code)
            .expect("Should be able to convert to transaction");

        let serialized_tx: SerializedTx = JsValue::into_serde(&transaction)
            .expect("Should be able to serialize to a Transaction");

        let hash = serialized_tx.hash();
        let bytes = serialized_tx.bytes();

        assert_eq!(hash.len(), 64);
        assert_eq!(bytes.len(), 596);
    }
}
