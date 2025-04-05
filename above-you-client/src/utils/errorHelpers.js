export function extractErrorMessage(err, fallback = 'Something went wrong') {
  // If the error is already a string, return it directly
  if (typeof err === 'string') {
    return err;
  }

  // Check if a valid error is in the response data
  if (
    err?.response?.data?.error &&
    typeof err.response.data.error === 'string'
  ) {
    return err.response.data.error;
  }

  // If no valid error, return the fallback
  return fallback;
}
