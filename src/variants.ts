export const active = (selector: string): string => `${selector}:active`;
export const disabled = (selector: string): string => `${selector}:disabled`;
export const even = (selector: string): string => `${selector}:nth-child(even)`;
export const first = (selector: string): string => `${selector}:first-child`;
export const focus = (selector: string): string => `${selector}:focus`;
export const focusWithin = (selector: string): string => `${selector}:focus-within`;
export const hover = (selector: string): string => `${selector}:hover`;
export const last = (selector: string): string => `${selector}:last-child`;
export const odd = (selector: string): string => `${selector}:nth-child(odd)`;
export const visited = (selector: string): string => `${selector}:visited`;

export const groupActive = (selector: string): string => `.group:active ${selector}`;
export const groupFocus = (selector: string): string => `.group:focus ${selector}`;
// What do you even do with this?
export const groupFocusWithin = (selector: string): string => `.group:focus-within ${selector}`;
export const groupHover = (selector: string): string => `.group:hover ${selector}`;
