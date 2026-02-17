import { useEffect, useState } from "react";

export default function App() {

  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/summary/month")
      .then(res => res.json())
      .then(setSummary);
  }, []);

  if (!summary) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>Sistema Financeiro</h1>

      <p>Entradas: R$ {summary.income}</p>
      <p>Saídas: R$ {summary.expense}</p>
      <p>Saldo: R$ {summary.net}</p>
      <p>Status: {summary.status}</p>

    </div>
  );
}
