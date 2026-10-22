# UUID Adapter

```js
// adapters/uuid/index.js
import { v4 } from "uuid"

export const generateId = () => v4()
export const generatePrefixedId = (prefix) => `${prefix}_${v4()}`
```
