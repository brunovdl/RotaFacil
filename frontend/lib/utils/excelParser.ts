export function parseExcelRows(rows: Record<string, any>[]): Array<{ cep: string; street: string; number: string }> {
  return rows.map((row) => {
    const keys = Object.keys(row);
    const cepKey = keys.find(k => k.toLowerCase().includes('cep') || k.toLowerCase().includes('postal'));
    const streetKey = keys.find(k => k.toLowerCase().includes('rua') || k.toLowerCase().includes('logradouro'));
    const numberKey = keys.find(k => k.toLowerCase().includes('num') || k.toLowerCase().includes('numero'));

    return {
      cep: cepKey ? String(row[cepKey]) : '',
      street: streetKey ? String(row[streetKey]) : '',
      number: numberKey ? String(row[numberKey]) : '',
    };
  });
}
