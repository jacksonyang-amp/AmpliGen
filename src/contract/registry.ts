import { checkActionContract } from './actions.ts';
import type { ContractAction } from './actions.ts';

export interface ActionSink {
  readonly name: string;
  send(action: ContractAction): void;
}

export type EmitResult =
  | { status: 'no_sink' }
  | { status: 'duplicate' }
  | { status: 'invalid'; violations: string[] }
  | { status: 'emitted'; delivered: number; failures: string[] };

export interface ActionRegistry {
  addSink(sink: ActionSink): () => void;
  sinkCount(): number;
  emit(action: ContractAction): EmitResult;
}

export function createActionRegistry(): ActionRegistry {
  const sinks: ActionSink[] = [];
  const emittedEventIds = new Set<string>();

  return {
    addSink(sink) {
      sinks.push(sink);
      return () => {
        const index = sinks.indexOf(sink);
        if (index >= 0) sinks.splice(index, 1);
      };
    },
    sinkCount() {
      return sinks.length;
    },
    emit(action) {
      if (sinks.length === 0) return { status: 'no_sink' };

      const violations = checkActionContract(action);
      if (violations.length > 0) return { status: 'invalid', violations };

      const eventId = action.properties.event_id;
      if (emittedEventIds.has(eventId)) return { status: 'duplicate' };
      emittedEventIds.add(eventId);

      let delivered = 0;
      const failures: string[] = [];
      for (const sink of [...sinks]) {
        try {
          sink.send(action);
          delivered += 1;
        } catch {
          failures.push(sink.name);
        }
      }
      return { status: 'emitted', delivered, failures };
    },
  };
}

export const actionRegistry: ActionRegistry = createActionRegistry();
