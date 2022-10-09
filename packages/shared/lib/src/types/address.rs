use std::str::FromStr;
use namada::types::address::ImplicitAddress;
use namada::types::key::{self, common::{PublicKey, SecretKey}, RefTo};

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Address {
    implicit: ImplicitAddress,
    private: SecretKey,
    public: PublicKey,
}

#[wasm_bindgen]
impl Address {
    /// Address helpers for wasm_bindgen
    #[wasm_bindgen(constructor)]
    pub fn new(secret: String) -> Address {
        let private = SecretKey::Ed25519(
            key::ed25519::SecretKey::from_str(&secret).expect("ed25519 encoding should not fail")
        );

        #[allow(clippy::useless_conversion)]
        let public = PublicKey::from(private.ref_to());
        let implicit = ImplicitAddress::from(&public);

        Address {
            implicit,
            private,
            public,
        }
    }

    pub fn implicit(&self) -> String {
        self.implicit.0.to_string()
    }

    pub fn public(&self) -> String {
        self.public.to_string()
    }

    pub fn private(&self) -> String {
        self.private.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn can_generate_implicit_address() {
        let secret = String::from("1498b5467a63dffa2dc9d9e069caf075d16fc33fdd4c3b01bfadae6433767d93");
        let address = Address::new(secret);
        let implicit = address.implicit();

        assert_eq!(implicit, "5162ABDCBABA0940AA25C9885DE79D088433EB9D");
    }

    #[test]
    fn can_return_correct_public_key() {
        let secret = String::from("1498b5467a63dffa2dc9d9e069caf075d16fc33fdd4c3b01bfadae6433767d93");
        let address = Address::new(secret);
        let public = address.public();
        let pad = "00";

        assert_eq!(public, format!("{}{}", pad, "b7a3c12dc0c8c748ab07525b701122b88bd78f600c76342d27f25e5f92444cde"));
    }

    #[test]
    fn can_return_correct_secret_key() {
        let secret = String::from("1498b5467a63dffa2dc9d9e069caf075d16fc33fdd4c3b01bfadae6433767d93");
        let address = Address::new(secret.clone());
        let private = address.private();
        let pad = "00";

        assert_eq!(format!("{}{}", pad, secret), private);
    }
}
