use std::str::FromStr;

use borsh::{BorshDeserialize, BorshSerialize};
use namada::{
    ibc::core::ics24_host::identifier::{ChannelId, PortId},
    ledger::args,
    types::{
        address::Address,
        chain::ChainId,
        masp::{PaymentAddress, TransferSource, TransferTarget},
        token::Amount,
        transaction::GasLimit,
    },
};
use wasm_bindgen::JsError;

#[derive(BorshSerialize, BorshDeserialize)]
pub struct TxMsg {
    token: String,
    fee_amount: u64,
    gas_limit: u64,
    tx_code: Vec<u8>,
    chain_id: String,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct SubmitBondMsg {
    source: String,
    validator: String,
    amount: u64,
    tx_code: Vec<u8>,
    native_token: String,
    tx: TxMsg,
}

/// Maps serialized tx_msg into BondTx args.
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
/// * `password` - Password used for storage decryption.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn bond_tx_args(tx_msg: &[u8], password: Option<String>) -> Result<args::Bond, JsError> {
    let tx_msg = SubmitBondMsg::try_from_slice(tx_msg)?;

    let SubmitBondMsg {
        native_token,
        source,
        validator,
        amount,
        tx_code: bond_tx_code,
        tx,
    } = tx_msg;

    let source = Address::from_str(&source)?;
    let native_token = Address::from_str(&native_token)?;
    let validator = Address::from_str(&validator)?;
    let amount = Amount::from(amount);

    let args = args::Bond {
        tx: tx_msg_into_args(tx, password)?,
        validator,
        amount,
        source: Some(source),
        native_token,
        tx_code_path: bond_tx_code,
    };

    Ok(args)
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct SubmitUnbondMsg {
    source: String,
    validator: String,
    amount: u64,
    tx_code: Vec<u8>,
    tx: TxMsg,
}

/// Maps serialized tx_msg into UnbondTx args.
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
/// * `password` - Password used for storage decryption.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn unbond_tx_args(tx_msg: &[u8], password: Option<String>) -> Result<args::Unbond, JsError> {
    let tx_msg = SubmitUnbondMsg::try_from_slice(tx_msg)?;

    let SubmitUnbondMsg {
        source,
        validator,
        amount,
        tx_code: bond_tx_code,
        tx,
    } = tx_msg;

    let source = Address::from_str(&source)?;
    let validator = Address::from_str(&validator)?;
    let amount = Amount::from(amount);

    let args = args::Unbond {
        tx: tx_msg_into_args(tx, password)?,
        validator,
        amount,
        source: Some(source),
        tx_code_path: bond_tx_code,
    };

    Ok(args)
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct SubmitTransferMsg {
    tx: TxMsg,
    source: String,
    target: String,
    token: String,
    sub_prefix: Option<String>,
    amount: u64,
    native_token: String,
    tx_code: Vec<u8>,
}

/// Maps serialized tx_msg into TransferTx args.
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
/// * `password` - Password used for storage decryption.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn transfer_tx_args(
    tx_msg: &[u8],
    password: Option<String>,
) -> Result<args::TxTransfer, JsError> {
    let tx_msg = SubmitTransferMsg::try_from_slice(tx_msg)?;
    let SubmitTransferMsg {
        tx,
        source,
        target,
        token,
        sub_prefix,
        amount,
        native_token,
        tx_code: transfer_tx_code,
    } = tx_msg;

    let source = Address::from_str(&source)?;
    let target = match Address::from_str(&target) {
        Ok(v) => Ok(TransferTarget::Address(v)),
        Err(e1) => match PaymentAddress::from_str(&target) {
            Ok(v) => Ok(TransferTarget::PaymentAddress(v)),
            Err(e2) => Err(JsError::new(&format!("Hello2 {}, {}", e1, e2))),
        },
    }?;
    let native_token = Address::from_str(&native_token)?;
    let token = Address::from_str(&token)?;
    let amount = Amount::from(amount);

    let args = args::TxTransfer {
        tx: tx_msg_into_args(tx, password)?,
        source: TransferSource::Address(source),
        target,
        token,
        sub_prefix,
        amount,
        native_token,
        tx_code_path: transfer_tx_code,
    };
    Ok(args)
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct SubmitIbcTransferMsg {
    tx: TxMsg,
    source: String,
    receiver: String,
    token: String,
    sub_prefix: Option<String>,
    amount: u64,
    port_id: String,
    channel_id: String,
    timeout_height: Option<u64>,
    timeout_sec_offset: Option<u64>,
    tx_code: Vec<u8>,
}

/// Maps serialized tx_msg into IbcTransferTx args.
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
/// * `password` - Password used for storage decryption.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn ibc_transfer_tx_args(
    tx_msg: &[u8],
    password: Option<String>,
) -> Result<args::TxIbcTransfer, JsError> {
    let tx_msg = SubmitIbcTransferMsg::try_from_slice(tx_msg)?;
    let SubmitIbcTransferMsg {
        tx,
        source,
        receiver,
        token,
        sub_prefix,
        amount,
        port_id,
        channel_id,
        timeout_height,
        timeout_sec_offset,
        tx_code: transfer_tx_code,
    } = tx_msg;

    let source = Address::from_str(&source)?;
    let token = Address::from_str(&token)?;
    let amount = Amount::from(amount);
    //TODO: fix unwraps
    let port_id = PortId::from_str(&port_id).unwrap();
    let channel_id = ChannelId::from_str(&channel_id).unwrap();

    let args = args::TxIbcTransfer {
        tx: tx_msg_into_args(tx, password)?,
        source,
        receiver,
        token,
        sub_prefix,
        amount,
        port_id,
        channel_id,
        timeout_height,
        timeout_sec_offset,
        tx_code_path: transfer_tx_code,
    };
    Ok(args)
}

/// Maps serialized tx_msg into Tx args.
/// This is common for all tx types.
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
/// * `password` - Password used for storage decryption.
///
/// # Errors
///
/// Returns JsError if token address is invalid.
fn tx_msg_into_args(tx_msg: TxMsg, password: Option<String>) -> Result<args::Tx, JsError> {
    let TxMsg {
        token,
        fee_amount,
        gas_limit,
        tx_code,
        chain_id,
    } = tx_msg;

    let token = Address::from_str(&token)?;
    let fee_amount = Amount::from(fee_amount);
    let password = password.map(|pwd| zeroize::Zeroizing::new(pwd));

    let args = args::Tx {
        dry_run: false,
        dump_tx: false,
        force: false,
        broadcast_only: false,
        ledger_address: (),
        wallet_alias_force: false,
        initialized_account_alias: None,
        fee_amount,
        fee_token: token.clone(),
        gas_limit: GasLimit::from(gas_limit),
        expiration: None,
        chain_id: Some(ChainId(String::from(chain_id))),
        signing_key: None,
        signer: None,
        tx_reveal_code_path: tx_code,
        password,
    };
    Ok(args)
}
