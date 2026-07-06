---
name: Wouter Route children-as-function hooks bug
description: Calling hooks directly inside a wouter <Route> render-prop function causes "Rendered fewer hooks than expected" errors.
---

Never call React hooks (useState, useEffect, useAuth, useLocation, etc.) directly inside the inline function passed as `children` to a wouter `<Route>`, e.g. `<Route path="/">{() => { useAuth(); ... }}</Route>`.

**Why:** wouter's `<Route>` invokes that children function conditionally (only when the path matches) as part of its own render body, not as a separate component boundary. Hooks called inside end up attached to `Route`'s own hook call sequence, which changes count/order across renders depending on whether the path matches — triggering "Rendered fewer hooks than expected" runtime errors.

**How to apply:** whenever a `<Route>` child needs to call hooks (e.g. an auth-check redirect component, or any route-level logic), extract it into a properly named function component and pass it via `component={MyComponent}` (or render `<MyComponent />` from the children function without calling hooks in the wrapper itself). Reserve inline `{() => <RealComponent />}` patterns for cases where the wrapper itself calls zero hooks — delegate any hook usage to the rendered component.
