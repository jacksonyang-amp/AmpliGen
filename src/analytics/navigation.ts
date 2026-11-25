export const MAX_FLUSH_WAIT_MS = 1000;

export interface FlushThenNavigateOptions {
  flush: (() => Promise<void>) | undefined;
  navigate: () => void;
  timeoutMs?: number;
  setTimer?: (callback: () => void, delayMs: number) => unknown;
  clearTimer?: (handle: unknown) => void;
}

/**
 * Waits for a flush for at most timeoutMs, then navigates exactly once.
 * With no flush function, navigates immediately.
 */
export function flushThenNavigate(options: FlushThenNavigateOptions): void {
  const { flush, navigate } = options;
  const timeoutMs = options.timeoutMs ?? MAX_FLUSH_WAIT_MS;
  const setTimer = options.setTimer ?? ((callback, delayMs) => setTimeout(callback, delayMs));
  const clearTimer = options.clearTimer ?? ((handle) => clearTimeout(handle as ReturnType<typeof setTimeout>));

  let done = false;
  let timer: unknown;
  const finish = () => {
    if (done) return;
    done = true;
    if (timer !== undefined) clearTimer(timer);
    navigate();
  };

  if (flush === undefined) {
    finish();
    return;
  }

  timer = setTimer(finish, timeoutMs);
  try {
    flush().then(finish, finish);
  } catch {
    finish();
  }
}
