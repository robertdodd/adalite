"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Networks = exports.utils = exports.InvalidDataReason = exports.CertificateType = exports.AddressType = exports.Ada = void 0;
const errors_1 = require("./errors");
const invalidDataReason_1 = require("./errors/invalidDataReason");
Object.defineProperty(exports, "InvalidDataReason", { enumerable: true, get: function () { return invalidDataReason_1.InvalidDataReason; } });
const deriveAddress_1 = require("./interactions/deriveAddress");
const getExtendedPublicKeys_1 = require("./interactions/getExtendedPublicKeys");
const getSerial_1 = require("./interactions/getSerial");
const getVersion_1 = require("./interactions/getVersion");
const runTests_1 = require("./interactions/runTests");
const showAddress_1 = require("./interactions/showAddress");
const signTx_1 = require("./interactions/signTx");
const address_1 = require("./parsing/address");
const transaction_1 = require("./parsing/transaction");
const public_1 = require("./types/public");
Object.defineProperty(exports, "AddressType", { enumerable: true, get: function () { return public_1.AddressType; } });
Object.defineProperty(exports, "CertificateType", { enumerable: true, get: function () { return public_1.CertificateType; } });
const utils_1 = __importDefault(require("./utils"));
exports.utils = utils_1.default;
const assert_1 = require("./utils/assert");
const parse_1 = require("./utils/parse");
__exportStar(require("./errors"), exports);
__exportStar(require("./types/public"), exports);
const CLA = 0xd7;
function wrapConvertDeviceStatusError(fn) {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        try {
            return yield fn(...args);
        }
        catch (e) {
            if (e && e.statusCode) {
                throw new errors_1.DeviceStatusError(e.statusCode);
            }
            throw e;
        }
    });
}
function wrapRetryStillInCall(fn) {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        try {
            return yield fn(...args);
        }
        catch (e) {
            if (e &&
                e.statusCode &&
                e.statusCode === errors_1.DeviceStatusCodes.ERR_STILL_IN_CALL) {
                return yield fn(...args);
            }
            throw e;
        }
    });
}
function interact(interaction, send) {
    return __awaiter(this, void 0, void 0, function* () {
        let cursor = interaction.next();
        let first = true;
        while (!cursor.done) {
            const apdu = cursor.value;
            const res = first
                ? yield wrapRetryStillInCall(send)(apdu)
                : yield send(apdu);
            first = false;
            cursor = interaction.next(res);
        }
        return cursor.value;
    });
}
class Ada {
    constructor(transport, scrambleKey = "ADA") {
        this.transport = transport;
        const methods = [
            "getVersion",
            "getSerial",
            "getExtendedPublicKeys",
            "signTransaction",
            "deriveAddress",
            "showAddress",
        ];
        this.transport.decorateAppAPIMethods(this, methods, scrambleKey);
        this._send = (params) => __awaiter(this, void 0, void 0, function* () {
            let response = yield wrapConvertDeviceStatusError(this.transport.send)(CLA, params.ins, params.p1, params.p2, params.data);
            response = utils_1.default.stripRetcodeFromResponse(response);
            if (params.expectedResponseLength != null) {
                assert_1.assert(response.length === params.expectedResponseLength, `unexpected response length: ${response.length} instead of ${params.expectedResponseLength}`);
            }
            return response;
        });
    }
    getVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const version = yield interact(this._getVersion(), this._send);
            return { version, compatibility: getVersion_1.getCompatibility(version) };
        });
    }
    *_getVersion() {
        return yield* getVersion_1.getVersion();
    }
    getSerial() {
        return __awaiter(this, void 0, void 0, function* () {
            return interact(this._getSerial(), this._send);
        });
    }
    *_getSerial() {
        const version = yield* getVersion_1.getVersion();
        return yield* getSerial_1.getSerial(version);
    }
    runTests() {
        return __awaiter(this, void 0, void 0, function* () {
            return interact(this._runTests(), this._send);
        });
    }
    *_runTests() {
        const version = yield* getVersion_1.getVersion();
        return yield* runTests_1.runTests(version);
    }
    getExtendedPublicKeys({ paths }) {
        return __awaiter(this, void 0, void 0, function* () {
            parse_1.validate(parse_1.isArray(paths), invalidDataReason_1.InvalidDataReason.GET_EXT_PUB_KEY_PATHS_NOT_ARRAY);
            const parsed = paths.map((path) => parse_1.parseBIP32Path(path, invalidDataReason_1.InvalidDataReason.INVALID_PATH));
            return interact(this._getExtendedPublicKeys(parsed), this._send);
        });
    }
    *_getExtendedPublicKeys(paths) {
        const version = yield* getVersion_1.getVersion();
        return yield* getExtendedPublicKeys_1.getExtendedPublicKeys(version, paths);
    }
    getExtendedPublicKey({ path }) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getExtendedPublicKeys({ paths: [path] }))[0];
        });
    }
    deriveAddress({ network, address }) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsedParams = address_1.parseAddress(network, address);
            return interact(this._deriveAddress(parsedParams), this._send);
        });
    }
    *_deriveAddress(addressParams) {
        const version = yield* getVersion_1.getVersion();
        return yield* deriveAddress_1.deriveAddress(version, addressParams);
    }
    showAddress({ network, address }) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsedParams = address_1.parseAddress(network, address);
            return interact(this._showAddress(parsedParams), this._send);
        });
    }
    *_showAddress(addressParams) {
        const version = yield* getVersion_1.getVersion();
        return yield* showAddress_1.showAddress(version, addressParams);
    }
    signTransaction(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsedTx = transaction_1.parseTransaction(tx);
            return interact(this._signTx(parsedTx), this._send);
        });
    }
    *_signTx(tx) {
        const version = yield* getVersion_1.getVersion();
        return yield* signTx_1.signTransaction(version, tx);
    }
}
exports.Ada = Ada;
exports.default = Ada;
exports.Networks = {
    Mainnet: {
        networkId: 0x01,
        protocolMagic: 764824073,
    },
    Testnet: {
        networkId: 0x00,
        protocolMagic: 42,
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0FkYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JBLHFDQUFnRTtBQUNoRSxrRUFBK0Q7QUFxWGIsa0dBclh6QyxxQ0FBaUIsT0FxWHlDO0FBblhuRSxnRUFBNkQ7QUFDN0QsZ0ZBQTZFO0FBQzdFLHdEQUFxRDtBQUNyRCwwREFBeUU7QUFDekUsc0RBQW1EO0FBQ25ELDREQUF5RDtBQUN6RCxrREFBd0Q7QUFDeEQsK0NBQWdEO0FBQ2hELHVEQUEwRDtBQU8xRCwyQ0FBd0U7QUFvVy9ELDRGQXBXQSxvQkFBVyxPQW9XQTtBQUFFLGdHQXBXQSx3QkFBZSxPQW9XQTtBQW5XckMsb0RBQTRCO0FBbVd5QyxnQkFuVzlELGVBQUssQ0FtVzhEO0FBbFcxRSwyQ0FBdUM7QUFDdkMseUNBQW1FO0FBRW5FLDJDQUF3QjtBQUN4QixpREFBOEI7QUFFOUIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBRWpCLFNBQVMsNEJBQTRCLENBQXFCLEVBQUs7SUFFN0QsT0FBTyxDQUFPLEdBQUcsSUFBSSxFQUFFLEVBQUU7UUFDdkIsSUFBSTtZQUNGLE9BQU8sTUFBTSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUMxQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsRUFBRTtnQkFDckIsTUFBTSxJQUFJLDBCQUFpQixDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQTthQUMxQztZQUNELE1BQU0sQ0FBQyxDQUFDO1NBQ1Q7SUFDSCxDQUFDLENBQUEsQ0FBQztBQUNKLENBQUM7QUFxQkQsU0FBUyxvQkFBb0IsQ0FBcUIsRUFBSztJQUVyRCxPQUFPLENBQU8sR0FBRyxJQUFTLEVBQUUsRUFBRTtRQUM1QixJQUFJO1lBQ0YsT0FBTyxNQUFNLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxD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