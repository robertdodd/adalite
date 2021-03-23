"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionMetadataType = exports.PoolOwnerType = exports.TxOutputDestinationType = exports.HARDENED = exports.CertificateType = exports.AddressType = void 0;
var AddressType;
(function (AddressType) {
    AddressType[AddressType["BASE"] = 0] = "BASE";
    AddressType[AddressType["POINTER"] = 4] = "POINTER";
    AddressType[AddressType["ENTERPRISE"] = 6] = "ENTERPRISE";
    AddressType[AddressType["BYRON"] = 8] = "BYRON";
    AddressType[AddressType["REWARD"] = 14] = "REWARD";
})(AddressType = exports.AddressType || (exports.AddressType = {}));
var CertificateType;
(function (CertificateType) {
    CertificateType[CertificateType["STAKE_REGISTRATION"] = 0] = "STAKE_REGISTRATION";
    CertificateType[CertificateType["STAKE_DEREGISTRATION"] = 1] = "STAKE_DEREGISTRATION";
    CertificateType[CertificateType["STAKE_DELEGATION"] = 2] = "STAKE_DELEGATION";
    CertificateType[CertificateType["STAKE_POOL_REGISTRATION"] = 3] = "STAKE_POOL_REGISTRATION";
})(CertificateType = exports.CertificateType || (exports.CertificateType = {}));
exports.HARDENED = 0x80000000;
var TxOutputDestinationType;
(function (TxOutputDestinationType) {
    TxOutputDestinationType["THIRD_PARTY"] = "third_party";
    TxOutputDestinationType["DEVICE_OWNED"] = "device_owned";
})(TxOutputDestinationType = exports.TxOutputDestinationType || (exports.TxOutputDestinationType = {}));
var PoolOwnerType;
(function (PoolOwnerType) {
    PoolOwnerType["THIRD_PARTY"] = "third_party";
    PoolOwnerType["DEVICE_OWNED"] = "device_owned";
})(PoolOwnerType = exports.PoolOwnerType || (exports.PoolOwnerType = {}));
var TransactionMetadataType;
(function (TransactionMetadataType) {
    TransactionMetadataType["ARBITRARY_HASH"] = "arbitrary_hash";
})(TransactionMetadataType = exports.TransactionMetadataType || (exports.TransactionMetadataType = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGljLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3R5cGVzL3B1YmxpYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFrQkEsSUFBWSxXQTBCWDtBQTFCRCxXQUFZLFdBQVc7SUFLbkIsNkNBQWEsQ0FBQTtJQUtiLG1EQUFnQixDQUFBO0lBS2hCLHlEQUFtQixDQUFBO0lBS25CLCtDQUFjLENBQUE7SUFLZCxrREFBZSxDQUFBO0FBQ25CLENBQUMsRUExQlcsV0FBVyxHQUFYLG1CQUFXLEtBQVgsbUJBQVcsUUEwQnRCO0FBT0QsSUFBWSxlQXFCWDtBQXJCRCxXQUFZLGVBQWU7SUFLdkIsaUZBQXNCLENBQUE7SUFLdEIscUZBQXdCLENBQUE7SUFLeEIsNkVBQW9CLENBQUE7SUFLcEIsMkZBQTJCLENBQUE7QUFDL0IsQ0FBQyxFQXJCVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQXFCMUI7QUFtQ1ksUUFBQSxRQUFRLEdBQUcsVUFBVSxDQUFDO0FBNExuQyxJQUFZLHVCQWFYO0FBYkQsV0FBWSx1QkFBdUI7SUFNL0Isc0RBQTJCLENBQUE7SUFNM0Isd0RBQTZCLENBQUE7QUFDakMsQ0FBQyxFQWJXLHVCQUF1QixHQUF2QiwrQkFBdUIsS0FBdkIsK0JBQXVCLFFBYWxDO0FBOENELElBQVksYUFXWDtBQVhELFdBQVksYUFBYTtJQUtyQiw0Q0FBMkIsQ0FBQTtJQUszQiw4Q0FBNkIsQ0FBQTtBQUNqQyxDQUFDLEVBWFcsYUFBYSxHQUFiLHFCQUFhLEtBQWIscUJBQWEsUUFXeEI7QUE0VUQsSUFBWSx1QkFLWDtBQUxELFdBQVksdUJBQXVCO0lBRS9CLDREQUFpQyxDQUFBO0FBR3JDLENBQUMsRUFMVyx1QkFBdUIsR0FBdkIsK0JBQXVCLEtBQXZCLCtCQUF1QixRQUtsQyJ9