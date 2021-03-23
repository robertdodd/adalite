"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeTxInit = void 0;
const serialize_1 = require("../../utils/serialize");
const txOutput_1 = require("./txOutput");
const _serializePoolRegistrationCode = (isSigningPoolRegistrationAsOwner) => {
    const PoolRegistrationCodes = {
        SIGN_TX_POOL_REGISTRATION_NO: 3,
        SIGN_TX_POOL_REGISTRATION_YES: 4,
    };
    return serialize_1.uint8_to_buf((isSigningPoolRegistrationAsOwner
        ? PoolRegistrationCodes.SIGN_TX_POOL_REGISTRATION_YES
        : PoolRegistrationCodes.SIGN_TX_POOL_REGISTRATION_NO));
};
function _serializeOptionFlag(included) {
    return serialize_1.uint8_to_buf((included
        ? txOutput_1.SignTxIncluded.SIGN_TX_INCLUDED_YES
        : txOutput_1.SignTxIncluded.SIGN_TX_INCLUDED_NO));
}
function serializeTxInit(tx, numWitnesses) {
    return Buffer.concat([
        serialize_1.uint8_to_buf(tx.network.networkId),
        serialize_1.uint32_to_buf(tx.network.protocolMagic),
        _serializeOptionFlag(tx.ttl != null),
        _serializeOptionFlag(tx.metadata != null),
        _serializeOptionFlag(tx.validityIntervalStart != null),
        _serializePoolRegistrationCode(tx.isSigningPoolRegistrationAsOwner),
        serialize_1.uint32_to_buf(tx.inputs.length),
        serialize_1.uint32_to_buf(tx.outputs.length),
        serialize_1.uint32_to_buf(tx.certificates.length),
        serialize_1.uint32_to_buf(tx.withdrawals.length),
        serialize_1.uint32_to_buf(numWitnesses),
    ]);
}
exports.serializeTxInit = serializeTxInit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHhJbml0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ludGVyYWN0aW9ucy9zZXJpYWxpemF0aW9uL3R4SW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxxREFBb0U7QUFDcEUseUNBQTRDO0FBRTVDLE1BQU0sOEJBQThCLEdBQUcsQ0FDbkMsZ0NBQXlDLEVBQ25DLEVBQUU7SUFDUixNQUFNLHFCQUFxQixHQUFHO1FBQzFCLDRCQUE0QixFQUFFLENBQUM7UUFDL0IsNkJBQTZCLEVBQUUsQ0FBQztLQUNuQyxDQUFDO0lBRUYsT0FBTyx3QkFBWSxDQUNmLENBQUMsZ0NBQWdDO1FBQzdCLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyw2QkFBNkI7UUFDckQsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLDRCQUE0QixDQUFZLENBQ3ZFLENBQUM7QUFDTixDQUFDLENBQUM7QUFFRixTQUFTLG9CQUFvQixDQUFDLFFBQWlCO0lBQzNDLE9BQU8sd0JBQVksQ0FDZixDQUFDLFFBQVE7UUFDTCxDQUFDLENBQUMseUJBQWMsQ0FBQyxvQkFBb0I7UUFDckMsQ0FBQyxDQUFDLHlCQUFjLENBQUMsbUJBQW1CLENBQVksQ0FDdkQsQ0FBQTtBQUNMLENBQUM7QUFFRCxTQUFnQixlQUFlLENBQUMsRUFBcUIsRUFBRSxZQUFvQjtJQUN2RSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDakIsd0JBQVksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUNsQyx5QkFBYSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1FBQ3ZDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDO1FBQ3BDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDO1FBQ3pDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsSUFBSSxJQUFJLENBQUM7UUFDdEQsOEJBQThCLENBQUMsRUFBRSxDQUFDLGdDQUFnQyxDQUFDO1FBQ25FLHlCQUFhLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFrQixDQUFDO1FBQzNDLHlCQUFhLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFrQixDQUFDO1FBQzVDLHlCQUFhLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFrQixDQUFDO1FBQ2pELHlCQUFhLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFrQixDQUFDO1FBQ2hELHlCQUFhLENBQUMsWUFBd0IsQ0FBQztLQUMxQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBZEQsMENBY0MifQ==