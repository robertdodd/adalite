"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signTransaction = void 0;
const internal_1 = require("../types/internal");
const public_1 = require("../types/public");
const assert_1 = require("../utils/assert");
const serialize_1 = require("../utils/serialize");
const getVersion_1 = require("./getVersion");
const poolRegistrationCertificate_1 = require("./serialization/poolRegistrationCertificate");
const txCertificate_1 = require("./serialization/txCertificate");
const txInit_1 = require("./serialization/txInit");
const txOther_1 = require("./serialization/txOther");
const txOutput_1 = require("./serialization/txOutput");
const send = (params) => (Object.assign({ ins: 33 }, params));
function* signTx_init(tx, wittnessPaths) {
    const _response = yield send({
        p1: 1,
        p2: 0,
        data: txInit_1.serializeTxInit(tx, wittnessPaths.length),
        expectedResponseLength: 0,
    });
}
function* signTx_addInput(input) {
    yield send({
        p1: 2,
        p2: 0,
        data: txOther_1.serializeTxInput(input),
        expectedResponseLength: 0,
    });
}
function* signTx_addOutput(output) {
    {
        yield send({
            p1: 3,
            p2: 48,
            data: txOutput_1.serializeTxOutputBasicParams(output),
            expectedResponseLength: 0,
        });
    }
    for (const assetGroup of output.tokenBundle) {
        yield send({
            p1: 3,
            p2: 49,
            data: txOutput_1.serializeAssetGroup(assetGroup),
            expectedResponseLength: 0,
        });
        for (const token of assetGroup.tokens) {
            yield send({
                p1: 3,
                p2: 50,
                data: txOutput_1.serializeToken(token),
                expectedResponseLength: 0,
            });
        }
    }
    yield send({
        p1: 3,
        p2: 51,
        data: Buffer.alloc(0),
        expectedResponseLength: 0,
    });
}
function* signTx_addCertificate(certificate) {
    yield send({
        p1: 6,
        p2: 0,
        data: txCertificate_1.serializeTxCertificate(certificate),
        expectedResponseLength: 0,
    });
    if (certificate.type === internal_1.CertificateType.STAKE_POOL_REGISTRATION) {
        const pool = certificate.pool;
        yield send({
            p1: 6,
            p2: 48,
            data: poolRegistrationCertificate_1.serializePoolInitialParams(pool),
            expectedResponseLength: 0,
        });
        for (const owner of pool.owners) {
            yield send({
                p1: 6,
                p2: 49,
                data: poolRegistrationCertificate_1.serializePoolOwner(owner),
                expectedResponseLength: 0,
            });
        }
        for (const relay of pool.relays) {
            yield send({
                p1: 6,
                p2: 50,
                data: poolRegistrationCertificate_1.serializePoolRelay(relay),
                expectedResponseLength: 0,
            });
        }
        yield send({
            p1: 6,
            p2: 51,
            data: poolRegistrationCertificate_1.serializePoolMetadata(pool.metadata),
            expectedResponseLength: 0,
        });
        yield send({
            p1: 6,
            p2: 52,
            data: Buffer.alloc(0),
            expectedResponseLength: 0,
        });
    }
}
function* signTx_addWithdrawal(withdrawal) {
    yield send({
        p1: 7,
        p2: 0,
        data: txOther_1.serializeTxWithdrawal(withdrawal),
        expectedResponseLength: 0,
    });
}
function* signTx_setFee(fee) {
    yield send({
        p1: 4,
        p2: 0,
        data: txOther_1.serializeTxFee(fee),
        expectedResponseLength: 0,
    });
}
function* signTx_setTtl(ttl) {
    yield send({
        p1: 5,
        p2: 0,
        data: txOther_1.serializeTxTtl(ttl),
        expectedResponseLength: 0,
    });
}
function* signTx_setMetadata(metadata) {
    assert_1.assert(metadata.type === public_1.TransactionMetadataType.ARBITRARY_HASH, 'Metadata type not implemented');
    yield send({
        p1: 8,
        p2: 0,
        data: txOther_1.serializeTxMetadata(metadata.metadataHashHex),
        expectedResponseLength: 0,
    });
}
function* signTx_setValidityIntervalStart(validityIntervalStartStr) {
    yield send({
        p1: 9,
        p2: 0,
        data: txOther_1.serializeTxValidityStart(validityIntervalStartStr),
    });
}
function* signTx_awaitConfirm() {
    const response = yield send({
        p1: 10,
        p2: 0,
        data: Buffer.alloc(0),
        expectedResponseLength: internal_1.TX_HASH_LENGTH,
    });
    return {
        txHashHex: response.toString("hex"),
    };
}
function* signTx_getWitness(path) {
    const response = yield send({
        p1: 15,
        p2: 0,
        data: txOther_1.serializeTxWitnessRequest(path),
        expectedResponseLength: 64,
    });
    return {
        path: path,
        witnessSignatureHex: serialize_1.buf_to_hex(response),
    };
}
function generateWitnessPaths(tx) {
    if (tx.isSigningPoolRegistrationAsOwner) {
        assert_1.assert(tx.certificates.length == 1, "bad certificates length");
        const cert = tx.certificates[0];
        assert_1.assert(cert.type === internal_1.CertificateType.STAKE_POOL_REGISTRATION, "bad certificate type");
        const witnessOwner = cert.pool.owners.find((owner) => owner.type === internal_1.PoolOwnerType.DEVICE_OWNED);
        assert_1.assert(witnessOwner != null, "missing witness owner");
        assert_1.assert(witnessOwner.type === internal_1.PoolOwnerType.DEVICE_OWNED, "bad witness owner type");
        return [witnessOwner.path];
    }
    else {
        const witnessPaths = {};
        function _insert(path) {
            const pathKey = JSON.stringify(path);
            witnessPaths[pathKey] = path;
        }
        for (const input of tx.inputs) {
            assert_1.assert(input.path != null, "input missing path");
            _insert(input.path);
        }
        for (const cert of tx.certificates) {
            assert_1.assert(cert.type !== internal_1.CertificateType.STAKE_POOL_REGISTRATION, "wrong cert type");
            _insert(cert.path);
        }
        for (const withdrawal of tx.withdrawals) {
            _insert(withdrawal.path);
        }
        return Object.values(witnessPaths);
    }
}
function* signTransaction(version, tx) {
    getVersion_1.ensureLedgerAppVersionCompatible(version);
    const witnessPaths = generateWitnessPaths(tx);
    yield* signTx_init(tx, witnessPaths);
    for (const input of tx.inputs) {
        yield* signTx_addInput(input);
    }
    for (const output of tx.outputs) {
        yield* signTx_addOutput(output);
    }
    yield* signTx_setFee(tx.fee);
    if (tx.ttl != null) {
        yield* signTx_setTtl(tx.ttl);
    }
    for (const certificate of tx.certificates) {
        yield* signTx_addCertificate(certificate);
    }
    for (const withdrawal of tx.withdrawals) {
        yield* signTx_addWithdrawal(withdrawal);
    }
    if (tx.metadata != null) {
        yield* signTx_setMetadata(tx.metadata);
    }
    if (tx.validityIntervalStart != null) {
        yield* signTx_setValidityIntervalStart(tx.validityIntervalStart);
    }
    const { txHashHex } = yield* signTx_awaitConfirm();
    const witnesses = [];
    for (const path of witnessPaths) {
        const witness = yield* signTx_getWitness(path);
        witnesses.push(witness);
    }
    return {
        txHashHex,
        witnesses,
    };
}
exports.signTransaction = signTransaction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnblR4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVyYWN0aW9ucy9zaWduVHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsZ0RBQW1GO0FBRW5GLDRDQUF5RDtBQUN6RCw0Q0FBeUM7QUFDekMsa0RBQWlEO0FBR2pELDZDQUFnRTtBQUNoRSw2RkFBd0o7QUFDeEosaUVBQXVFO0FBQ3ZFLG1EQUF5RDtBQUN6RCxxREFBNEw7QUFDNUwsdURBQTZHO0FBZ0I3RyxNQUFNLElBQUksR0FBRyxDQUFDLE1BS2IsRUFBYyxFQUFFLENBQUMsaUJBQUcsR0FBRyxRQUFrQixNQUFNLEVBQUcsQ0FBQTtBQUduRCxRQUFRLENBQUMsQ0FBQyxXQUFXLENBQ25CLEVBQXFCLEVBQ3JCLGFBQStCO0lBTS9CLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDO1FBQzNCLEVBQUUsR0FBZTtRQUNqQixFQUFFLEdBQVc7UUFDYixJQUFJLEVBQUUsd0JBQWUsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLE1BQU0sQ0FBQztRQUMvQyxzQkFBc0IsRUFBRSxDQUFDO0tBQzFCLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxRQUFRLENBQUMsQ0FBQyxlQUFlLENBQ3ZCLEtBQWtCO0lBTWxCLE1BQU0sSUFBSSxDQUFDO1FBQ1QsRUFBRSxHQUFpQjtRQUNuQixFQUFFLEdBQVc7UUFDYixJQUFJLEVBQUUsMEJBQWdCLENBQUMsS0FBSyxDQUFDO1FBQzdCLHNCQUFzQixFQUFFLENBQUM7S0FDMUIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELFFBQVEsQ0FBQyxDQUFDLGdCQUFnQixDQUN4QixNQUFvQjtJQVVwQjtRQUNFLE1BQU0sSUFBSSxDQUFDO1lBQ1QsRUFBRSxHQUFrQjtZQUNwQixFQUFFLElBQWU7WUFDakIsSUFBSSxFQUFFLHVDQUE0QixDQUFDLE1BQU0sQ0FBQztZQUMxQyxzQkFBc0IsRUFBRSxDQUFDO1NBQzFCLENBQUMsQ0FB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