import * as yup from 'yup';

export const createSchema = (shape) => yup.object().shape(shape);

export const string = (options = {}) => {
  let schema = yup.string().trim();
  if (options.required) schema = schema.required(options.required);
  if (options.min) schema = schema.min(options.min[0], options.min[1]);
  if (options.max) schema = schema.max(options.max[0], options.max[1]);
  if (options.email) schema = schema.email(options.email);
  if (options.oneOf) schema = schema.oneOf(options.oneOf[0], options.oneOf[1]);
  return schema;
};

/** Like `string` but never trims: passwords must be validated exactly as typed. */
export const secret = (options = {}) => {
  let schema = yup.string();
  if (options.required) schema = schema.required(options.required);
  if (options.min) schema = schema.min(options.min[0], options.min[1]);
  if (options.max) schema = schema.max(options.max[0], options.max[1]);
  return schema;
};

export const sameAs = (fieldName, message) =>
  yup.string().oneOf([yup.ref(fieldName)], message);

export const validate = async (schema, data) => {
  try {
    const result = await schema.validate(data, { abortEarly: false });
    return { success: true, data: result, errors: null };
  } catch (error) {
    if (!error.inner) throw error;
    return {
      success: false,
      data: null,
      errors: error.inner.reduce((acc, err) => {
        if (err.path && !acc[err.path]) acc[err.path] = err.message;
        return acc;
      }, {}),
    };
  }
};
