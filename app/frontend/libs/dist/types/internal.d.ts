/// <reference types="node" />
import type { TransactionMetadataType } from './public';
import { AddressType, CertificateType, PoolOwnerType, RelayType } from './public';
export declare type VarlenAsciiString = string & {
    __type: 'ascii';
};
export declare type FixlenHexString<N> = string & {
    __type: 'hex';
    __length: N;
};
export declare type HexString = string & {
    __type: 'hex';
};
export declare type _Uint64_num = number & {
    __type: 'uint64_t';
};
export declare type _Uint64_bigint = bigint & {
    __type: 'uint64_t';
};
export declare type ValidBIP32Path = Array<Uint32_t> & {
    __type: 'bip32_path';
};
export declare type Uint64_str = string & {
    __type: 'uint64_t';
};
export declare type Uint32_t = number & {
    __type: 'uint32_t';
};
export declare type Uint16_t = number & {
    __type: 'uint16_t';
};
export declare type Uint8_t = number & {
    __type: 'uint8_t';
};
export { AddressType, CertificateType, RelayType, PoolOwnerType, TransactionMetadataType };
export { Version, DeviceCompatibility } from './public';
export declare const KEY_HASH_LENGTH = 28;
export declare const TX_HASH_LENGTH = 32;
export declare type ParsedCertificate = {
    type: CertificateType.STAKE_REGISTRATION;
    path: ValidBIP32Path;
} | {
    type: CertificateType.STAKE_DEREGISTRATION;
    path: ValidBIP32Path;
} | {
    type: CertificateType.STAKE_DELEGATION;
    path: ValidBIP32Path;
    poolKeyHashHex: FixlenHexString<typeof KEY_HASH_LENGTH>;
} | {
    type: CertificateType.STAKE_POOL_REGISTRATION;
    pool: ParsedPoolParams;
};
export declare const TOKEN_POLICY_LENGTH = 28;
export declare type ParsedToken = {
    assetNameHex: HexString;
    amount: Uint64_str;
};
export declare type ParsedAssetGroup = {
    policyIdHex: FixlenHexString<typeof TOKEN_POLICY_LENGTH>;
    tokens: Array<ParsedToken>;
};
export declare type ParsedNetwork = {
    protocolMagic: Uint32_t;
    networkId: Uint8_t;
};
export declare type ParsedMetadata = {
    type: TransactionMetadataType.ARBITRARY_HASH;
    metadataHashHex: FixlenHexString<32>;
};
export declare type ParsedTransaction = {
    network: ParsedNetwork;
    inputs: ParsedInput[];
    outputs: ParsedOutput[];
    fee: Uint64_str;
    ttl: Uint64_str | null;
    certificates: ParsedCertificate[];
    withdrawals: ParsedWithdrawal[];
    metadata: ParsedMetadata | null;
    validityIntervalStart: Uint64_str | null;
    isSigningPoolRegistrationAsOwner: boolean;
};
export declare type ParsedInput = {
    txHashHex: FixlenHexString<typeof TX_HASH_LENGTH>;
    outputIndex: Uint32_t;
    path: ValidBIP32Path | null;
};
export declare type ParsedWithdrawal = {
    amount: Uint64_str;
    path: ValidBIP32Path;
};
export declare type ParsedMargin = {
    numerator: Uint64_str;
    denominator: Uint64_str;
};
export declare type ParsedPoolParams = {
    keyHashHex: FixlenHexString<28>;
    vrfHashHex: FixlenHexString<32>;
    pledge: Uint64_str;
    cost: Uint64_str;
    margin: ParsedMargin;
    rewardAccountHex: FixlenHexString<29>;
    owners: ParsedPoolOwner[];
    relays: ParsedPoolRelay[];
    metadata: ParsedPoolMetadata | null;
};
export declare type ParsedPoolOwner = {
    type: PoolOwnerType.DEVICE_OWNED;
    path: ValidBIP32Path;
} | {
    type: PoolOwnerType.THIRD_PARTY;
    hashHex: FixlenHexString<typeof KEY_HASH_LENGTH>;
};
export declare type ParsedPoolRelay = {
    type: RelayType.SINGLE_HOST_IP_ADDR;
    port: Uint16_t | null;
    ipv4: Buffer | null;
    ipv6: Buffer | null;
} | {
    type: RelayType.SINGLE_HOST_HOSTNAME;
    port: Uint16_t | null;
    dnsName: VarlenAsciiString;
} | {
    type: RelayType.MULTI_HOST;
    dnsName: VarlenAsciiString;
};
export declare type ParsedPoolMetadata = {
    url: VarlenAsciiString;
    hashHex: FixlenHexString<32>;
} & {
    __brand: 'pool_metadata';
};
export declare const enum StakingChoiceType {
    NO_STAKING = "no_staking",
    STAKING_KEY_PATH = "staking_key_path",
    STAKING_KEY_HASH = "staking_key_hash",
    BLOCKCHAIN_POINTER = "blockchain_pointer"
}
declare type ParsedBlockchainPointer = {
    blockIndex: Uint32_t;
    txIndex: Uint32_t;
    certificateIndex: Uint32_t;
};
declare type StakingChoiceNone = {
    type: StakingChoiceType.NO_STAKING;
};
declare type StakingChoicePath = {
    type: StakingChoiceType.STAKING_KEY_PATH;
    path: ValidBIP32Path;
};
declare type StakingChoiceHash = {
    type: StakingChoiceType.STAKING_KEY_HASH;
    hashHex: FixlenHexString<typeof KEY_HASH_LENGTH>;
};
declare type StakingChoicePointer = {
    type: StakingChoiceType.BLOCKCHAIN_POINTER;
    pointer: ParsedBlockchainPointer;
};
export declare type StakingChoice = StakingChoiceNone | StakingChoicePath | StakingChoiceHash | StakingChoicePointer;
declare type ByronAddressParams = {
    type: AddressType.BYRON;
    protocolMagic: Uint32_t;
    spendingPath: ValidBIP32Path;
    stakingChoice: StakingChoiceNone;
};
declare type ShelleyAddressParams = {
    type: AddressType.BASE | AddressType.ENTERPRISE | AddressType.POINTER | AddressType.REWARD;
    networkId: Uint8_t;
    spendingPath: ValidBIP32Path;
} & ({
    type: AddressType.BASE;
    stakingChoice: StakingChoicePath | StakingChoiceHash;
} | {
    type: AddressType.ENTERPRISE;
    stakingChoice: StakingChoiceNone;
} | {
    type: AddressType.POINTER;
    stakingChoice: StakingChoicePointer;
} | {
    type: AddressType.REWARD;
    stakingChoice: StakingChoiceNone;
});
export declare type ParsedAddressParams = ByronAddressParams | ShelleyAddressParams;
export declare const enum TxOutputType {
    SIGN_TX_OUTPUT_TYPE_ADDRESS_BYTES = 1,
    SIGN_TX_OUTPUT_TYPE_ADDRESS_PARAMS = 2
}
export declare type OutputDestination = {
    type: TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_BYTES;
    addressHex: HexString;
} | {
    type: TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_PARAMS;
    addressParams: ParsedAddressParams;
};
export declare type ParsedOutput = {
    amount: Uint64_str;
    tokenBundle: ParsedAssetGroup[];
    destination: OutputDestination;
};
export declare const ASSET_NAME_LENGTH_MAX = 32;
//# sourceMappingURL=internal.d.ts.map