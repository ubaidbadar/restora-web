const MOBILE = /^(?:\+92|0092|92|0)?(3\d{9})$/;

const SEPARATORS = /[\s\-().]/g;

/** 03XXXXXXXXX, +923XXXXXXXXX, 923XXXXXXXXX or 00923XXXXXXXXX becomes +923XXXXXXXXX; anything else is null. */
export default function normalizePhone(input: string): string | null {
  const match = MOBILE.exec(input.replace(SEPARATORS, ''));
  return match ? `+92${match[1]}` : null;
}
