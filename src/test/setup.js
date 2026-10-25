import '@testing-library/jest-dom/vitest';
import { webcrypto } from 'node:crypto';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom has no Web Crypto subtle API; Node's implementation is used for password hashing.
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
window.scrollTo = vi.fn();
window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));

beforeEach(() => { localStorage.clear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
