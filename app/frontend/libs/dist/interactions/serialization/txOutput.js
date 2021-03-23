"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeToken = exports.serializeAssetGroup = exports.serializeTxOutputBasicParams = exports.SignTxIncluded = void 0;
const assert_1 = require("../../utils/assert");
const serialize_1 = require("../../utils/serialize");
const addressParams_1 = require("./addressParams");
exports.SignTxIncluded = Object.freeze({
    SIGN_TX_INCLUDED_NO: 1,
    SIGN_TX_INCLUDED_YES: 2,
});
function serializeTxOutputDestination(destination) {
    switch (destination.type) {
        case 1:
            return Buffer.concat([
                serialize_1.uint8_to_buf(destination.type),
                serialize_1.uint32_to_buf(destination.addressHex.length / 2),
                serialize_1.hex_to_buf(destination.addressHex)
            ]);
        case 2:
            return Buffer.concat([
                serialize_1.uint8_to_buf(destination.type),
                addressParams_1.serializeAddressParams(destination.addressParams)
            ]);
        default:
            assert_1.unreachable(destination);
    }
}
function serializeTxOutputBasicParams(output) {
    return Buffer.concat([
        serializeTxOutputDestination(output.destination),
        serialize_1.uint64_to_buf(output.amount),
        serialize_1.uint32_to_buf(output.tokenBundle.length),
    ]);
}
exports.serializeTxOutputBasicParams = serializeTxOutputBasicParams;
function serializeAssetGroup(assetGroup) {
    return Buffer.concat([
        serialize_1.hex_to_buf(assetGroup.policyIdHex),
        serialize_1.uint32_to_buf(assetGroup.tokens.length),
    ]);
}
exports.serializeAssetGroup = serializeAssetGroup;
function serializeToken(token) {
    return Buffer.concat([
        serialize_1.uint32_to_buf(token.assetNameHex.length / 2),
        serialize_1.hex_to_buf(token.assetNameHex),
        serialize_1.uint64_to_buf(token.amount),
    ]);
}
exports.serializeToken = serializeToken;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHhPdXRwdXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW50ZXJhY3Rpb25zL3NlcmlhbGl6YXRpb24vdHhPdXRwdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsK0NBQWlEO0FBQ2pELHFEQUErRjtBQUMvRixtREFBeUQ7QUFHNUMsUUFBQSxjQUFjLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUMxQyxtQkFBbUIsRUFBRSxDQUFDO0lBQ3RCLG9CQUFvQixFQUFFLENBQUM7Q0FDeEIsQ0FBQyxDQUFDO0FBRUgsU0FBUyw0QkFBNEIsQ0FBQyxXQUE4QjtJQUNsRSxRQUFRLFdBQVcsQ0FBQyxJQUFJLEVBQUU7UUFDeEI7WUFDRSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ25CLHdCQUFZLENBQUMsV0FBVyxDQUFDLElBQWUsQ0FBQztnQkFDekMseUJBQWEsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFhLENBQUM7Z0JBQzVELHNCQUFVLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQzthQUNuQyxDQUFDLENBQUE7UUFDSjtZQUNFLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDbkIsd0JBQVksQ0FBQyxXQUFXLENBQUMsSUFBZSxDQUFDO2dCQUN6QyxzQ0FBc0IsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDO2FBQ2xELENBQUMsQ0FBQTtRQUNKO1lBQ0Usb0JBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtLQUMzQjtBQUNILENBQUM7QUFFRCxTQUFnQiw0QkFBNEIsQ0FDMUMsTUFBb0I7SUFFcEIsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ25CLDRCQUE0QixDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDaEQseUJBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzVCLHlCQUFhLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFrQixDQUFDO0tBQ3JELENBQUMsQ0FBQztBQUNMLENBQUM7QUFSRCxvRUFRQztBQUVELFNBQWdCLG1CQUFtQixDQUNqQyxVQUE0QjtJQUU1QixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDbkIsc0JBQVUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1FBQ2xDLHlCQUFhLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFrQixDQUFDO0tBQ3BELENBQUMsQ0FBQztBQUNMLENBQUM7QUFQRCxrREFPQztBQUVELFNBQWdCLGNBQWMsQ0FDNUIsS0FBa0I7SUFFbEIsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ25CLHlCQUFhLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBYSxDQUFDO1FBQ3hELHNCQUFVLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztRQUM5Qix5QkFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7S0FDNUIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQVJELHdDQVFDIn0=