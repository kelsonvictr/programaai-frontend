// src/utils/payment.ts
export const calcularValores = (preco: string) => {
  const base = parseFloat(preco.replace("R$", "").replace(",", "."))
  const valorCartao = +(base * 1.08).toFixed(2)
  const parcela12 = +(valorCartao / 12).toFixed(2)

  return { base, valorCartao, parcela12 }
}
