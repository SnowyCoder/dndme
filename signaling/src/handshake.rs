use std::mem::size_of;

use axum::extract::ws::{Message, WebSocket};
use p256::ecdsa::{VerifyingKey, Signature, signature::Verifier};
use rand::{thread_rng, Rng};
use sha2::{Digest, Sha256};
use thiserror::Error;
use tracing::debug;

use crate::protocol::{
    ClientId, HandshakeClientIdentification, PROTOCOL_VERSION, SESSION_ID_LENGTH_BYTES,
};

#[derive(Error, Debug)]
pub enum HandshakeError {
    #[error("invalid message received")]
    InvalidProof,
    #[error("Error sending message: {0}")]
    SendError(#[from] axum::Error),
    #[error("Stream closed")]
    StreamClosed,
    #[error("Invalid message received")]
    InvalidMessage,
}

pub async fn perform_handshake(socket: &mut WebSocket) -> Result<ClientId, HandshakeError> {
    let mut send_data = [0u8; size_of::<u64>() + SESSION_ID_LENGTH_BYTES];

    thread_rng().fill(&mut send_data[size_of::<u64>()..]);
    send_data[..size_of::<u64>()].copy_from_slice(&PROTOCOL_VERSION.to_le_bytes());

    socket.send(Message::Binary(send_data.into())).await?;

    let data = loop {
        match socket.recv().await.ok_or(HandshakeError::StreamClosed)?? {
            Message::Binary(d) => break d,
            Message::Close(_) => return Err(HandshakeError::StreamClosed)?,
            _ => {}
        }
    };

    debug!("Received data {:X?}", data);
    let msg: HandshakeClientIdentification =
        rmp_serde::from_slice(&data).unwrap();//.map_err(|_| HandshakeError::InvalidMessage)?;

    // check received proof
    let key =
        VerifyingKey::from_sec1_bytes(&msg.identity).map_err(|_| HandshakeError::InvalidMessage)?;

    let signature_correct = Signature::from_slice(&msg.proof)
        .and_then(|s| key.verify(&send_data[size_of::<u64>()..], &s))
        .is_ok();

    if !signature_correct {
        return Err(HandshakeError::InvalidProof);
    }

    let mut hasher = Sha256::new();
    hasher.update(b"dndme.signaling");
    hasher.update(&msg.identity);
    let res = hasher.finalize();

    Ok(ClientId(res.as_slice().try_into().unwrap()))
}
