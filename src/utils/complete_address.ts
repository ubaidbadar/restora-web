export default function completeAddress(address?: string, area?: string): string | undefined {
  const savedAddress = address?.trim();
  const savedArea = area?.trim();
  if (!savedAddress) return savedArea || undefined;
  if (savedArea && !savedAddress.toLowerCase().includes(savedArea.toLowerCase())) return `${savedArea}, ${savedAddress}`;
  return savedAddress;
}
