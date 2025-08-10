const { z } = require('zod');

function validate(schema, data) {
  const res = schema.safeParse(data);
  if (!res.success) {
    const message = res.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    const err = new Error(message);
    err.status = 400;
    throw err;
  }
  return res.data;
}

module.exports = { z, validate };
