/*
 * Turning an Axios error into something a human can read.
 *
 * FastAPI returns two different shapes and they need different handling:
 *
 *   HTTPException  ->  { detail: "Email already registered" }
 *   Pydantic 422   ->  { detail: [ { loc: ['body','password'],
 *                                    msg: 'Password must contain a number',
 *                                    type: 'value_error' } ] }
 *
 * Passing the second one straight into a toast renders "[object Object]" — or
 * crashes React, since an array of objects is not a valid child. Every call
 * site must go through these helpers.
 */

/** Extract a single readable message, suitable for a toast. */
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  // No response at all: the request never reached the server.
  if (!error?.response) {
    return navigator.onLine
      ? 'Could not reach the server. Is the API running?'
      : 'You appear to be offline.';
  }

  const { status, data } = error.response;

  if (status === 429) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  const detail = data?.detail;

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    // Show the first validation failure; the rest surface on their own fields.
    const first = detail[0];
    const field = fieldNameFrom(first);
    const message = first?.msg?.replace(/^Value error,\s*/i, '') || 'Invalid value';
    return field ? `${humanise(field)}: ${message}` : message;
  }

  return fallback;
};

/**
 * Map a 422 response onto { fieldName: message } so errors can be shown
 * beneath the input they belong to rather than only in a toast.
 */
export const getFieldErrors = (error) => {
  const detail = error?.response?.data?.detail;
  if (!Array.isArray(detail)) return {};

  return detail.reduce((accumulator, item) => {
    const field = fieldNameFrom(item);
    if (field && !accumulator[field]) {
      accumulator[field] = item?.msg?.replace(/^Value error,\s*/i, '') || 'Invalid value';
    }
    return accumulator;
  }, {});
};

/** `loc` looks like ['body', 'password']; the field is the last segment. */
const fieldNameFrom = (item) => {
  const loc = item?.loc;
  if (!Array.isArray(loc) || loc.length === 0) return null;
  const last = loc[loc.length - 1];
  return typeof last === 'string' && last !== 'body' ? last : null;
};

/** full_name -> Full name */
const humanise = (field) =>
  field.replace(/_/g, ' ').replace(/^./, (character) => character.toUpperCase());
