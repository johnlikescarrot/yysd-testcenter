/**
 * Deferred entry point injected into every HTML page by scripts/localize_vi.py.
 * Kept separate from vi-runtime.mjs so the runtime stays pure (and fully unit
 * testable) while this file owns the single browser side effect.
 */

import { VI_DICTIONARY } from "./vi-dictionary.mjs";
import { boot } from "./vi-runtime.mjs";

boot(document, VI_DICTIONARY);
