export function extractErrorMessage(err, fallback = 'Something went wrong') {
	if (
		err?.response?.data?.error &&
		typeof err.response.data.error === 'string'
	) {
		return err.response.data.error;
	}
	return fallback;
}