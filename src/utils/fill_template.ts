
/** Replaces {name}-style placeholders. Unknown placeholders are left as written so the mistake is visible. */
export default function fillTemplate(template: string, values: Record<string, string | number | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => {
    const value = values[key];
    return value === undefined || value === '' ? whole : String(value);
  });
}
