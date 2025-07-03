// Interface for DSKYStateManager, extracted from features/dsky/types/IDSKYState.ts
import type { IDSKYState } from "./IDSKYState";
import type { IDSKYActions } from "./IDSKYActions";

export interface IDSKYStateManager {
  state: IDSKYState;
  actions: IDSKYActions;
}
