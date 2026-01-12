<script>
document.getElementById('btn-calcular-frete').addEventListener('click', function () {
  const cep = document.getElementById('cep').value.replace(/\D/g, '');
  const resultado = document.getElementById('resultado-frete');

  if (cep.length !== 8) {
    resultado.innerHTML = '<p>Digite um CEP válido.</p>';
    return;
  }

  resultado.innerHTML = '<p>Calculando frete...</p>';

  fetch('https://melhorenvio/calcular-frete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cep_destino: cep,
      produto: {
        peso: {{ product.weight | divided_by: 1000 }},
        altura: 10,
        largura: 15,
        comprimento: 20,
        valor: {{ product.price | divided_by: 100 }}
      }
    })
  })
  .then(res => res.json())
  .then(fretes => {
    if (!fretes || fretes.length === 0) {
      resultado.innerHTML = '<p>Frete indisponível para este CEP.</p>';
      return;
    }

    let html = '<ul>';

    fretes.forEach(frete => {
      if (frete.price) {
        html += `
          <li>
            <strong>${frete.company.name}</strong><br>
            ${frete.name}<br>
            Prazo: ${frete.delivery_time} dias<br>
            Valor: R$ ${frete.price}
          </li>
        `;
      }
    });

    html += '</ul>';
    resultado.innerHTML = html;
  })
  .catch(() => {
    resultado.innerHTML = '<p>Erro ao calcular o frete.</p>';
  });
});
</script>
