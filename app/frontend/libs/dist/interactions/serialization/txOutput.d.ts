/// <reference types="node" />
import type { ParsedAssetGroup, ParsedOutput, ParsedToken } from "../../types/internal";
export declare const SignTxIncluded: Readonly<{
    SIGN_TX_INCLUDED_NO: number;
    SIGN_TX_INCLUDED_YES: number;
}>;
export declare function serializeTxOutputBasicParams(output: ParsedOutput): Buffer;
export declare function serializeAssetGroup(assetGroup: ParsedAssetGroup): Buffer;
export declare function serializeToken(token: ParsedToken): Buffer;
//# sourceMappingURL=txOutput.d.ts.map