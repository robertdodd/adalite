"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTransaction = void 0;
const errors_1 = require("../errors");
const invalidDataReason_1 = require("../errors/invalidDataReason");
const internal_1 = require("../types/internal");
const public_1 = require("../types/public");
const parse_1 = require("../utils/parse");
const parse_2 = require("../utils/parse");
const parse_3 = require("../utils/parse");
const address_1 = require("./address");
const certificate_1 = require("./certificate");
const constants_1 = require("./constants");
const network_1 = require("./network");
function parseCertificates(certificates) {
    parse_2.validate(parse_2.isArray(certificates), invalidDataReason_1.InvalidDataReason.CERTIFICATES_NOT_ARRAY);
    const parsed = certificates.map(cert => certificate_1.parseCertificate(cert));
    parse_2.validate(parsed.every((cert) => cert.type !== internal_1.CertificateType.STAKE_POOL_REGISTRATION) || parsed.length === 1, invalidDataReason_1.InvalidDataReason.CERTIFICATES_COMBINATION_FORBIDDEN);
    return parsed;
}
function parseToken(token) {
    const assetNameHex = parse_3.parseHexString(token.assetNameHex, invalidDataReason_1.InvalidDataReason.OUTPUT_INVALID_ASSET_NAME);
    parse_2.validate(token.assetNameHex.length <= internal_1.ASSET_NAME_LENGTH_MAX * 2, invalidDataReason_1.InvalidDataReason.OUTPUT_INVALID_ASSET_NAME);
    const amount = parse_3.parseUint64_str(token.amount, {}, invalidDataReason_1.InvalidDataReason.OUTPUT_INVALID_AMOUNT);
    return {
        assetNameHex,
        amount,
    };
}
function parseAssetGroup(assetGroup) {
    parse_2.validate(parse_2.isArray(assetGroup.tokens), invalidDataReason_1.InvalidDataReason.OUTPUT_INVALID_ASSET_GROUP_TOKENS_NOT_ARRAY);
    parse_2.validate(assetGroup.tokens.length <= constants_1.TOKENS_IN_GROUP_MAX, invalidDataReason_1.InvalidDataReason.OUTPUT_INVALID_ASSET_GROUP_TOKENS_TOO_LARGE);
    return {
        policyIdHex: parse_3.parseHexStringOfLength(assetGroup.policyIdHex, internal_1.TOKEN_POLICY_LENGTH, invalidDataReason_1.InvalidDataReason.OUTPUT_INVALID_TOKEN_POLICY),
        tokens: assetGroup.tokens.map(t => parseToken(t))
    };
}
function parseTxMetadata(metadata) {
    switch (metadata.type) {
        case public_1.TransactionMetadataType.ARBITRARY_HASH: {
            return {
                type: public_1.TransactionMetadataType.ARBITRARY_HASH,
                metadataHashHex: parse_3.parseHexStringOfLength(metadata.params.metadataHashHex, 32, invalidDataReason_1.InvalidDataReason.METADATA_INVALID_HASH)
            };
        }
        default:
            throw new errors_1.InvalidData(invalidDataReason_1.InvalidDataReason.METADATA_UNKNOWN_TYPE);
    }
}
function parseTransaction(tx) {
    var _a, _b, _c, _d;
    const network = network_1.parseNetwork(tx.network);
    parse_2.validate(parse_2.isArray(tx.inputs), invalidDataReason_1.InvalidDataReason.INPUTS_NOT_ARRAY);
    const inputs = tx.inputs.map(inp => parseTxInput(inp));
    parse_2.validate(parse_2.isArray(tx.outputs), invalidDataReason_1.InvalidDataReason.OUTPUTS_NOT_ARRAY);
    const outputs = tx.outputs.map(o => parseTxOutput(o, tx.network));
    const fee = parse_3.parseUint64_str(tx.fee, { max: constants_1.MAX_LOVELACE_SUPPLY_STR }, invalidDataReason_1.InvalidDataReason.FEE_INVALID);
    const ttl = tx.ttl == null
        ? null
        : parse_3.parseUint64_str(tx.ttl, { min: "1" }, invalidDataReason_1.InvalidDataReason.TTL_INVALID);
    parse_2.validate(parse_2.isArray((_a = tx.certificates) !== null && _a !== void 0 ? _a : []), invalidDataReason_1.InvalidDataReason.CERTIFICATES_NOT_ARRAY);
    const certificates = parseCertificates((_b = tx.certificates) !== null && _b !== void 0 ? _b : []);
    parse_2.validate(parse_2.isArray((_c = tx.withdrawals) !== null && _c !== void 0 ? _c : []), invalidDataReason_1.InvalidDataReason.WITHDRAWALS_NOT_ARRAY);
    const withdrawals = ((_d = tx.withdrawals) !== null && _d !== void 0 ? _d : []).map(w => parseWithdrawal(w));
    const metadata = tx.metadata == null
        ? null
        : parseTxMetadata(tx.metadata);
    const validityIntervalStart = tx.validityIntervalStart == null
        ? null
        : parse_3.parseUint64_str(tx.validityIntervalStart, { min: "1" }, invalidDataReason_1.InvalidDataReason.VALIDITY_INTERVAL_START_INVALID);
    const isSigningPoolRegistrationAsOwner = certificates.some((cert) => cert.type === internal_1.CertificateType.STAKE_POOL_REGISTRATION);
    if (isSigningPoolRegistrationAsOwner) {
        parse_2.validate(inputs.every(inp => inp.path == null), invalidDataReason_1.InvalidDataReason.INPUT_WITH_PATH_WHEN_SIGNING_AS_POOL_OWNER);
        parse_2.validate(outputs.every(out => out.destination.type === 1), invalidDataReason_1.InvalidDataReason.OUTPUT_WITH_PATH);
        parse_2.validate(withdrawals.length === 0, invalidDataReason_1.InvalidDataReason.WITHDRAWALS_FORBIDDEN);
    }
    return {
        network,
        inputs,
        outputs,
        ttl,
        metadata,
        validityIntervalStart: validityIntervalStart,
        withdrawals,
        certificates,
        fee,
        isSigningPoolRegistrationAsOwner
    };
}
exports.parseTransaction = parseTransaction;
function parseTxInput(input) {
    const txHashHex = parse_3.parseHexStringOfLength(input.txHashHex, internal_1.TX_HASH_LENGTH, invalidDataReason_1.InvalidDataReason.INPUT_INVALID_TX_HASH);
    const outputIndex = parse_3.parseUint32_t(input.outputIndex, invalidDataReason_1.InvalidDataReason.INPUT_INVALID_UTXO_INDEX);
    return {
        txHashHex,
        outputIndex,
        path: input.path != null ? parse_1.parseBIP32Path(input.path, invalidDataReason_1.InvalidDataReason.INPUT_INVALID_PATH) : null
    };
}
function parseWithdrawal(params) {
    return {
        amount: parse_3.parseUint64_str(params.amount, { max: constants_1.MAX_LOVELACE_SUPPLY_STR }, invalidDataReason_1.InvalidDataReason.WITHDRAWAL_INVALID_AMOUNT),
        path: parse_1.parseBIP32Path(params.path, invalidDataReason_1.InvalidDataReason.WITHDRAWAL_INVALID_PATH)
    };
}
function parseTxDestination(network, destination) {
    switch (destination.type) {
        case public_1.TxOutputDestinationType.THIRD_PARTY: {
            const params = destination.params;
            const addressHex = parse_3.parseHexString(params.addressHex, invalidDataReason_1.InvalidDataReason.OUTPUT_INVALID_ADDRESS);
            parse_2.validate(params.addressHex.length <= 128 * 2, invalidDataReason_1.InvalidDataReason.OUTPUT_INVALID_ADDRESS);
            return {
                type: 1,
                addressHex,
            };
        }
        case public_1.TxOutputDestinationType.DEVICE_OWNED: {
            const params = destination.params;
            return {
                type: 2,
                addressParams: address_1.parseAddress(network, params)
            };
        }
        default:
            throw new errors_1.InvalidData(invalidDataReason_1.InvalidDataReason.ADDRESS_UNKNOWN_TYPE);
    }
}
function parseTxOutput(output, network) {
    var _a, _b, _c;
    const amount = parse_3.parseUint64_str(output.amount, { max: constants_1.MAX_LOVELACE_SUPPLY_STR }, invalidDataReason_1.InvalidDataReason.OUTPUT_INVALID_AMOUNT);
    parse_2.validate(parse_2.isArray((_a = output.tokenBundle) !== null && _a !== void 0 ? _a : []), invalidDataReason_1.InvalidDataReason.OUTPUT_INVALID_TOKEN_BUNDLE);
    parse_2.validate(((_b = output.tokenBundle) !== null && _b !== void 0 ? _b : []).length <= constants_1.ASSET_GROUPS_MAX, invalidDataReason_1.InvalidDataReason.OUTPUT_INVALID_TOKEN_BUNDLE_TOO_LARGE);
    const tokenBundle = ((_c = output.tokenBundle) !== null && _c !== void 0 ? _c : []).map((ag) => parseAssetGroup(ag));
    const destination = parseTxDestination(network, output.destination);
    return {
        amount,
        tokenBundle,
        destination
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGFyc2luZy90cmFuc2FjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzQ0FBd0M7QUFDeEMsbUVBQWdFO0FBRWhFLGdEQUE4SDtBQWE5SCw0Q0FHeUI7QUFDekIsMENBQWdEO0FBQ2hELDBDQUFtRDtBQUNuRCwwQ0FBd0c7QUFDeEcsdUNBQXlDO0FBQ3pDLCtDQUFpRDtBQUNqRCwyQ0FBNkY7QUFDN0YsdUNBQXlDO0FBRXpDLFNBQVMsaUJBQWlCLENBQUMsWUFBZ0M7SUFDdkQsZ0JBQVEsQ0FBQyxlQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUscUNBQWlCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUUxRSxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsOEJBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtJQUcvRCxnQkFBUSxDQUNKLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssMEJBQWUsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUNwRyxxQ0FBaUIsQ0FBQyxrQ0FBa0MsQ0FDdkQsQ0FBQztJQUNGLE9BQU8sTUFBTSxDQUFBO0FBQ2pCLENBQUM7QUFHRCxTQUFTLFVBQVUsQ0FBQyxLQUFZO0lBQzVCLE1BQU0sWUFBWSxHQUFHLHNCQUFjLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxxQ0FBaUIsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQ3JHLGdCQUFRLENBQ0osS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLElBQUksZ0NBQXFCLEdBQUcsQ0FBQyxFQUN0RCxxQ0FBaUIsQ0FBQyx5QkFBeUIsQ0FDOUMsQ0FBQztJQUVGLE1BQU0sTUFBTSxHQUFHLHVCQUFlLENBQUMs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