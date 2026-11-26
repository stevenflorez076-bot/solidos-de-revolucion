const menu = document.getElementById('menu');
const visor = document.getElementById('visor');
const estado = document.getElementById('estado');
const formato = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
let version = 0;
let seleccionado;
let temporizador;

for (const ejercicio of ejercicios) {
  const enlace = document.createElement('a');
  enlace.href = '#' + ejercicio.name.toLowerCase();
  enlace.textContent = ejercicio.name;
  menu.append(enlace);
}

function mostrar() {
  const ejercicio = ejercicios.find(({name}) =>
    '#' + name.toLowerCase() === location.hash
  ) ?? ejercicios[0];
  if (ejercicio === seleccionado) return;
  seleccionado = ejercicio;

  const actual = ++version;
  clearTimeout(temporizador);
  for (const enlace of menu.children) {
    if (enlace.textContent === ejercicio.name) enlace.setAttribute('aria-current', 'page');
    else enlace.removeAttribute('aria-current');
  }

  document.getElementById('titulo').textContent = ejercicio.name;
  document.getElementById('resultado').textContent =
    'Volumen exacto: ' + ejercicio.exact + ' = ' + formato.format(ejercicio.value) + ' u³';
  document.getElementById('comandos').href =
    'comandos/' + ejercicio.name.toLowerCase() + '.txt';

  const contenedor = document.createElement('div');
  contenedor.id = 'ggb_' + actual;
  visor.replaceChildren(contenedor);
  estado.textContent = 'Cargando GeoGebra…';

  function mostrarError() {
    estado.textContent = 'GeoGebra no terminó de cargar. Puedes recargar la página o abrir los comandos del ejercicio.';
  }

  if (typeof GGBApplet === 'undefined') {
    mostrarError();
    return;
  }

  temporizador = setTimeout(mostrarError, 30000);
  try {
    const app = new GGBApplet({
      appName: 'classic',
      id: 'applet_' + actual,
      width: Math.max(480, visor.clientWidth),
      height: 560,
      language: 'en',
      showToolBar: true,
      showMenuBar: true,
      showAlgebraInput: true,
      appletOnLoad(api) {
        if (actual !== version) return;
        clearTimeout(temporizador);
        const fallos = [];
        api.setPerspective(visor.clientWidth < 700 ? 'AT' : 'AGT');
        for (const comando of ejercicio.commands) {
          try {
            if (!api.evalCommand(comando)) fallos.push(comando);
          } catch {
            fallos.push(comando);
          }
        }

        api.setVisible('h', false);
        api.setVisible('aprox', false);
        estado.textContent = fallos.length
          ? 'GeoGebra no pudo ejecutar: ' + fallos.join(' | ')
          : 'Construcción cargada. Usa los deslizadores de GeoGebra.';
      },
    }, true);
    app.inject(contenedor.id);
  } catch {
    clearTimeout(temporizador);
    mostrarError();
  }
}

window.addEventListener('hashchange', mostrar);
mostrar();
