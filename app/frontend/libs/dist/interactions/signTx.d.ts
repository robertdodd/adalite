import type { ParsedTransaction, Version } from "../types/internal";
import type { SignedTransactionData } from '../types/public';
import type { Interaction } from "./common/types";
export declare function signTransaction(version: Version, tx: ParsedTransaction): Interaction<SignedTransactionData>;
//# sourceMappingURL=signTx.d.ts.map