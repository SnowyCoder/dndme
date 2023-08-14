export class NetworkIdentity {
    private keys?: CryptoKeyPair;

    async createKey(): Promise<CryptoKeyPair> {
        const keys = await crypto.subtle.generateKey({
            "name": "ECDSA",
            "namedCurve": "P-256"
        } as EcKeyGenParams, true, ["sign", "verify"]);
        this.keys = keys;
        return keys;
    }

    private async getKeys(): Promise<CryptoKeyPair> {
        if (this.keys === undefined) {
            await this.createKey();
        }

        return this.keys!;
    }

    async sign(data: ArrayBuffer): Promise<ArrayBuffer> {
        const keys = await this.getKeys();

        const params = {
            name: "ECDSA",
            hash: "sha-256"
        } as EcdsaParams;

        const signature = await crypto.subtle.sign(params, keys.privateKey, data);

        return signature;
    }

    async exportPubKey(): Promise<ArrayBuffer> {
        const keys = await this.getKeys();

        return await crypto.subtle.exportKey("raw", keys.publicKey);
    }
}
