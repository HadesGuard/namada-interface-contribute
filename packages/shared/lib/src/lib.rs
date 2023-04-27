//! # shared
//!
//! A library of functions to integrate shared functionality from the Anoma ecosystem

#[cfg(feature = "parallel")]
pub use wasm_bindgen_rayon::init_thread_pool;

pub mod account;
pub mod query;
pub mod rpc_client;
pub mod sdk;
pub mod types;
mod utils;
