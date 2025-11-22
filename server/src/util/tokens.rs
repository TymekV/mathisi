use rand::{Rng, distr::Alphanumeric};
use sha2::{Digest, Sha256};

pub fn generate_token() -> String {
    let rng = rand::rngs::ThreadRng::default();

    let token: String = rng
        .sample_iter(&Alphanumeric)
        .take(64)
        .map(char::from)
        .collect();

    token
}

pub fn hash_token(token: &str) -> String {
    format!("{:x}", Sha256::digest(token))
}
