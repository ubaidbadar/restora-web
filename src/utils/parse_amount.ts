/** Reads what a cashier typed ("1,250", "Rs 1250") as whole rupees. */
const parseAmount = (input: unknown) => Number(String(input ?? '').replace(/[^\d]/g, '')) || 0;

export default parseAmount;
