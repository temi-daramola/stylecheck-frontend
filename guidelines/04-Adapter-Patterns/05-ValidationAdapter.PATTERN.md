# Validation Adapter (yup)

Same pattern again — schemas and validation helpers are built using yup
here, and this is the only file in the codebase allowed to import from
`yup` directly.

```js
// adapters/validation/index.js
import * as yup from "yup"

export const createSchema = (shape) => yup.object().shape(shape)

export const string = (options = {}) => {
  let schema = yup.string()
  if (options.required) schema = schema.required(options.required)
  if (options.min) schema = schema.min(options.min[0], options.min[1])
  if (options.max) schema = schema.max(options.max[0], options.max[1])
  if (options.email) schema = schema.email(options.email)
  return schema
}

export const number = (options = {}) => {
  let schema = yup.number()
  if (options.required) schema = schema.required(options.required)
  if (options.min) schema = schema.min(options.min[0], options.min[1])
  if (options.max) schema = schema.max(options.max[0], options.max[1])
  if (options.positive) schema = schema.positive(options.positive)
  return schema
}

export const boolean = (options = {}) => {
  let schema = yup.boolean()
  if (options.required) schema = schema.required(options.required)
  return schema
}

export const array = (options = {}) => {
  let schema = yup.array()
  if (options.of) schema = schema.of(options.of)
  if (options.required) schema = schema.required(options.required)
  if (options.min) schema = schema.min(options.min[0], options.min[1])
  return schema
}

export const validate = async (schema, data) => {
  try {
    const result = await schema.validate(data, { abortEarly: false })
    return { success: true, data: result, errors: null }
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: error.inner.reduce((acc, err) => {
        acc[err.path] = err.message
        return acc
      }, {}),
    }
  }
}
```

A module's `hooks/` file (e.g. a form hook like `useLoginForm`) imports
from this adapter to build and run its schema, never from `yup` directly:

```js
// ✅ Correct
import { createSchema, string, validate } from "@/adapters/validation"

// ❌ Wrong — direct third-party import outside adapters/
import * as yup from "yup"
```
