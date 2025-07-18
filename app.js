const monitorSelect = document.getElementById('monitorSelect');
const board = document.getElementById('kanbanBoard');
const toggleMode = document.getElementById('toggleMode');

toggleMode.onclick = () => {
  document.documentElement.classList.toggle('dark');
};

monitorSelect.onchange = async () => {
  const monitor = monitorSelect.value;
  if (!monitor) return;

  const res = await fetch(API_URL);
  const data = await res.json();
  board.innerHTML = '';

  const cards = data.filter(c => c.monitor === monitor);

  cards.forEach(card => {
    const el = document.createElement('div');
    el.className = `card ${card.status === 'feito' ? 'done' : ''}`;
    el.innerHTML = `
      <h3>${card.time}</h3>
      <p><strong>Data:</strong> ${card.data}</p>
      <p><strong>Status:</strong> ${card.status}</p>
      ${card.log ? `<p><strong>Log:</strong> ${card.log}</p>` : ''}
      <button onclick="marcarFeito('${card.id}')">✅ Concluir</button>
      <button onclick="pedirAjuda('${card.id}')">🆘 Pedir ajuda</button>
    `;
    board.appendChild(el);
  });
};

async function marcarFeito(id) {
  const log = new Date().toLocaleString('pt-BR');
  await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      id,
      monitor: monitorSelect.value,
      time: '',
      data: new Date().toLocaleDateString('pt-BR'),
      status: 'feito',
      log: log,
      precisaAjuda: false,
      transferidoPara: ''
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  alert('Card marcado como concluído!');
  location.reload();
}

async function pedirAjuda(id) {
  await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      id,
      monitor: monitorSelect.value,
      time: '',
      data: new Date().toLocaleDateString('pt-BR'),
      status: 'pendente',
      log: '',
      precisaAjuda: true,
      transferidoPara: ''
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  alert('Ajuda solicitada!');
  location.reload();
}
