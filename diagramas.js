const regiones = {
  discos: { fin: 2, techo: 4, arriba: x => x ** 2, abajo: () => 0, eje: 'x' },
  arandelas: { fin: 3, techo: 3, arriba: () => 2, abajo: () => 1, eje: 'x' },
  cascarones: { fin: 2, techo: 1.5, arriba: x => x ** 2 * (2 - x), abajo: () => 0, eje: 'y' },
};

function dibujarRegion(canvas, metodo, seccion = 1) {
  const { fin, techo, arriba, abajo, eje } = regiones[metodo];
  const ancho = canvas.clientWidth;
  const alto = canvas.clientHeight;
  if (!ancho || !alto) return;
  const escala = window.devicePixelRatio || 1;
  canvas.width = ancho * escala;
  canvas.height = alto * escala;

  const ctx = canvas.getContext('2d');
  ctx.scale(escala, escala);
  const x = valor => 38 + valor * (ancho - 67) / fin;
  const y = valor => alto - 34 - valor * (alto - 65) / techo;
  const primario = '#087d73';
  const naranja = '#bc521c';

  function linea(x1, y1, x2, y2, color, grosor = 1) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = grosor;
    ctx.stroke();
  }

  function curva(funcion, inicio, final) {
    for (let i = 0; i <= 80; i++) {
      const t = inicio + (final - inicio) * i / 80;
      ctx.lineTo(x(t), y(funcion(t)));
    }
  }

  ctx.font = '13px system-ui';
  ctx.fillStyle = '#314c51';
  ctx.textAlign = 'right';
  const salto = techo === 1.5 ? 0.5 : 1;
  for (let i = salto; i <= techo; i += salto) {
    linea(x(0), y(i), ancho - 21, y(i), '#dce8e5');
    ctx.fillText(String(i).replace('.', ','), x(0) - 9, y(i) + 4);
  }
  ctx.textAlign = 'center';
  for (let i = 0; i <= fin; i++) {
    linea(x(i), y(0), x(i), y(techo), '#dce8e5');
    ctx.fillText(i, x(i), y(0) + 21);
  }

  ctx.beginPath();
  ctx.moveTo(x(0), y(arriba(0)));
  curva(arriba, 0, fin);
  curva(abajo, fin, 0);
  ctx.closePath();
  ctx.fillStyle = '#bde8da';
  ctx.fill();
  ctx.strokeStyle = primario;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  linea(x(0) - 14, y(0), ancho - 12, y(0), eje === 'x' ? primario : '#314c51', 2);
  linea(x(0), y(0) + 5, x(0), 13, eje === 'y' ? primario : '#314c51', 2);
  ctx.fillStyle = '#314c51';
  ctx.fillText('x', ancho - 11, y(0) - 7);
  ctx.fillText('y', x(0) + 11, 18);
  linea(x(seccion), y(abajo(seccion)), x(seccion), y(arriba(seccion)), naranja, 4);
}

const portada = document.getElementById('portada');
if (portada) {
  new ResizeObserver(() => dibujarRegion(portada, 'discos')).observe(portada);
}
