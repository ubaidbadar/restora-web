import axios from 'axios';

export default function getAxiosMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Record<string, unknown> | undefined;
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.status === 'string') return data.status;
    if (typeof err.response?.statusText === 'string' && err.response.statusText) return err.response.statusText;
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