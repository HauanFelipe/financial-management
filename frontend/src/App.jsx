import { useEffect, useState } from "react";

const API = "http://localhost:3000";

export default function App() {
  const [summary, setSummary] = useState(null);

  const [kind, setKind] = useState("EXPENSE");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  async function loadSummary() {
    const res = await fetch(`${API}/summary/month`);
    const data = await res.json();
    setSummary(data);
  }

  useEffect(() => {
    loadSummary();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const value = Number(amount);

    if (!description.trim()) {
      alert("Digite uma descrição.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      alert("Digite um valor válido (maior que 0).");
      return;
    }

    const res = await fetch(`${API}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        description: description.trim(),
        amount: value,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Erro ao salvar transação.");
      return;
    }

    setDescription("");
    setAmount("");

    await loadSummary();
  }

  if (!summary) return <div style={{ padding: 24 }}>Carregando...</div>;

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1>Sistema Financeiro</h1>

      <div style={{ margin: "16px 0", padding: 12, border: "1px solid #333" }}>
        <p>Entradas: R$ {summary.income}</p>
        <p>Saídas: R$ {summary.expense}</p>
        <p>Saldo: R$ {summary.net}</p>
        <p>Status: {summary.status}</p>
      </div>

      <h2>Nova transação</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 360 }}>
        <label>
          Tipo
          <select value={kind} onChange={(e) => setKind(e.target.value)} style={{ width: "100%", padding: 8 }}>
            <option value="INCOME">Entrada</option>
            <option value="EXPENSE">Saída</option>
          </select>
        </label>

        <label>
          Descrição
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Gasolina"
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          Valor (R$)
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ex: 100"
            inputMode="decimal"
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <button type="submit" style={{ padding: 10, cursor: "pointer" }}>
          Salvar
        </button>
      </form>
    </div>
  );
}
