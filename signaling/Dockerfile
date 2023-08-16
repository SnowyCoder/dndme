FROM rust:1.71.1 as builder

RUN cargo new --bin /app
WORKDIR /app
COPY Cargo.toml Cargo.lock /app/

RUN cargo build --release

RUN rm -r /app/src
COPY . .
RUN touch /app/src/main.rs
RUN cargo build --release

# CMD ["/app/target/release/signaling"]

FROM debian:bookworm-slim
COPY --from=builder /app/target/release/signaling /usr/local/bin/signaling
CMD ["signaling"]
