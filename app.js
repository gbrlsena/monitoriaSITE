const API_URL = 'https://script.google.com/macros/s/AKfycbyFR3TiiFQ5iY3qmblxLno-zeHgh6bbUqhyvU4C5DEmeAE-_cBCQrKOduIiCQKuHu1kbw/exec';

const monitorSelect = document.getElementById('monitorSelect');
const board = document.getElementById('kanbanBoard');
const toggleMode = document.getElementById('toggleMode');

toggleMode.onclick = () => {
  document.documentElement.classList.toggle('dark');
};

monitorSelect.onchange = async () => {
  const monitor = monitorSelect.value;
  if (!monitor) {
    board.innerHTML = '<p>Por favor, selecione seu nome.</p>';
    return;
  }

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Erro ao buscar dados');
    const data = await res.json();

    // Filtra cards do monitor selecionado e ordena
    const cards = data
      .filter(c => c.monitor === monitor)
      .sort((a, b) => {
        if (a.status === 'feito' && b.status !== 'feito') return 1;
        if (a.status !== 'feito' && b.status === 'feito') return -1;
        // Ordena por data (formato dd/mm/yyyy)
        const d1 = a.data.split('/').reverse().join('-');
        const d2 = b.data.split('/').reverse().join('-');
        return new Date(d1) - new Date(d2);
      });

    board.innerHTML = '';

    if (cards.length === 0) {
      board.innerHTML = '<p>Você não tem cards hoje.</p>';
      return;
    }

    cards.forEach(card => {
      const el = document.createElement('div');
      el.className = `card ${card.status === 'feito' ? 'done' : ''}`;

      el.innerHTML = `
        <h3>${card.time}</h3>
        <p><strong>Data:</strong> ${card.data}</p>
        <p><strong>Status:</strong> ${card.status}</p>
        ${card.log ? `<p><strong>Log:</strong> ${card.log}</p>` : ''}
        <button class="btn btn-concluir" data-id="${card.id}" ${card.status === 'feito' ? 'disabled' : ''}>✅ Concluir</button>
        <button class="btn btn-ajuda" data-id="${card.id}">🆘 Pedir ajuda</button>
      `;

      board.appendChild(el);
    });

    // Eventos nos botões
    document.querySelectorAll('.btn-concluir').forEach(btn => {
      btn.addEventListener('click', () => marcarFeito(btn.dataset.id, monitor));
    });

    document.querySelectorAll('.btn-ajuda').forEach(btn => {
      btn.addEventListener('click', () => pedirAjuda(btn.dataset.id, monitor));
    });

  } catch (error) {
    board.innerHTML = `<p>Erro ao carregar cards: ${error.message}</p>`;
  }
};

async function marcarFeito(id, monitor) {
  const log = new Date().toLocaleString('pt-BR');
  const payload = {
    id,
    monitor,
    status: "feito",
    log: `Concluído em ${log}`,
    data: new Date().toLocaleDateString('pt-BR'),
    precisaAjuda: false,
    transferidoPara: ""
  };

  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    alert('Card marcado como concluído!');
    monitorSelect.dispatchEvent(new Event('change'));
  } catch {
    alert('Erro ao marcar card como concluído.');
  }
}

async function pedirAjuda(id, monitor) {
  const payload = {
    id,
    monitor,
    status: "pendente",
    log: "Pedido de ajuda solicitado",
    data: new Date().toLocaleDateString('pt-BR'),
    precisaAjuda: true,
    transferidoPara: ""
  };

  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    alert('Pedido de ajuda enviado!');
    monitorSelect.dispatchEvent(new Event('change'));
  } catch {
    alert('Erro ao enviar pedido de ajuda.');
  }
}
