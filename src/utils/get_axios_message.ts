import axios from 'axios';

export default function getAxiosMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Record<string, unknown> | undefined;
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.status === 'string') return data.status;
    if (typeof err.response?.statusText === 'string' && err.response.statusText) return err.response.statusText;
    // No answer at all (no internet, or the server can't be reached): say that, not axios's "Network Error".
    if (!err.response) return 'Could not reach Restora. Check the internet and try again.';
    if (err.message) return err.message;
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  if (typeof err === 'string') {
    return err;
  }

  return 'Something went wrong!';
}