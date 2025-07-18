const API_URL = 'https://script.google.com/macros/s/AKfycbxmou-BtgAPutxD1sqvQdhLdgNWYgXYp9OySbWyYNk0gJY9irdXULfA6AUBQ1K7tSKw-A/exec';

const monitorSelect = document.getElementById('monitorSelect');
const board = document.getElementById('kanbanBoard');
const toggleMode = document.getElementById('toggleMode');

toggleMode.onclick = () => {
  document.documentElement.classList.toggle('dark');
};

function formatarDataBR(dataStr) {
  const data = new Date(dataStr);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

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

    const dataHojeStr = formatarDataBR(new Date());

    const cards = data
      .filter(c => c.monitor === monitor && formatarDataBR(c.data) === dataHojeStr)
      .sort((a, b) => {
        if (a.status === 'feito' && b.status !== 'feito') return 1;
        if (a.status !== 'feito' && b.status === 'feito') return -1;

        return new Date(a.data) - new Date(b.data);
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
        <p><strong>Data:</strong> ${formatarDataBR(card.data)}</p>
        <p><strong>Status:</strong> ${card.status}</p>
        ${card.log ? `<p><strong>Log:</strong> ${card.log}</p>` : ''}
        <button class="btn btn-concluir" data-id="${card.id}" ${card.status === 'feito' ? 'disabled' : ''}>✅ Concluir</button>
        <button class="btn btn-ajuda" data-id="${card.id}">🆘 Pedir ajuda</button>
      `;

      board.appendChild(el);
    });

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
    data: new Date().toISOString(),
    precisaAjuda: false,
    transferidoPara: ""
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro na requisição');
    alert('Card marcado como concluído!');
    monitorSelect.dispatchEvent(new Event('change'));
  } catch (error) {
    alert('Erro ao marcar card como concluído.');
    console.error(error);
  }
}

async function pedirAjuda(id, monitor) {
  const payload = {
    id,
    monitor,
    status: "pendente",
    log: "Pedido de ajuda solicitado",
    data: new Date().toISOString(),
    precisaAjuda: true,
    transferidoPara: ""
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro na requisição');
    alert('Pedido de ajuda enviado!');
    monitorSelect.dispatchEvent(new Event('change'));
  } catch (error) {
    alert('Erro ao enviar pedido de ajuda.');
    console.error(error);
  }
}
