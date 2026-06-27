export function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCNJ(value?: string | null) {
  if (!value) return "—";
  const digits = onlyNumbers(value);
  if (digits.length !== 20) return value;
  return digits.replace(/(\d{7})(\d{2})(\d{4})(\d)(\d{2})(\d{4})/, "$1-$2.$3.$4.$5.$6");
}
