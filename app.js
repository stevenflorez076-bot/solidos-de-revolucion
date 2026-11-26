const metodo = document.querySelector('[data-method]').dataset.method;
const ejercicio = ejercicios.find(item => item.name.toLowerCase() === metodo);
const visor = document.getElementById('visor');
const estado = document.getElementById('estado');
const region = document.getElementById('region');
const giro = document.getElementById('giro');
const seccion = document.getElementById('seccion');
const divisiones = document.getElementById('divisiones');
const controles = [
  { input: giro, objeto: 'a', convertir: valor => valor * Math.PI / 180, mostrar: valor => valor + '°' },
  { input: seccion, objeto: 'p', convertir: Number, mostrar: valor => formato.format(valor) },
  { input: divisiones, objeto: 'n', convertir: Number, mostrar: String },
];
const formato = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function actualizarRegion() {
  dibujarRegion(region, metodo, seccion.valueAsNumber);
}
new ResizeObserver(actualizarRegion).observe(region);

function iniciarSimulador() {
  function mostrarError() {
    estado.textContent = 'GeoGebra no terminó de cargar. Puedes recargar la página o usar los comandos del ejercicio.';
  }
  if (typeof GGBApplet === 'undefined') {
    mostrarError();
    return;
  }

  const alto = 340;
  const temporizador = setTimeout(mostrarError, 30000);
  try {
    const app = new GGBApplet({
      id: 'solido3d',
      appName: 'classic',
      width: visor.clientWidth,
      height: alto,
      language: 'en',
      showToolBar: false,
      showMenuBar: false,
      showAlgebraInput: false,
      enableRightClick: false,
      appletOnLoad(api) {
        clearTimeout(temporizador);
        try {
          api.setPerspective('T');
          for (const comando of ejercicio.commands) {
            if (!api.evalCommand(comando)) throw new Error(comando);
          }
          for (const nombre of ['h', 'aprox', 'region', 'f', 'g', 'a', 'p', 'n']) {
            if (api.exists(nombre)) api.setVisible(nombre, false);
          }
          api.setColor('seccion', 188, 82, 28);
          api.setFilling('seccion', 0.7);

          for (const { input, objeto, convertir, mostrar } of controles) {
            const salida = document.getElementById(input.id + '-valor');
            input.addEventListener('input', () => {
              const valor = input.valueAsNumber;
              api.setValue(objeto, convertir(valor));
              salida.textContent = mostrar(valor);
              if (objeto === 'p') actualizarRegion();
              if (objeto === 'n') {
                document.getElementById('aprox').textContent = formato.format(api.getValue('aprox')) + ' u³';
              }
            });
            input.disabled = false;
          }
          new ResizeObserver(() => api.setSize(visor.clientWidth, alto)).observe(visor);
          estado.textContent = 'Modelo 3D listo.';
        } catch (error) {
          console.error(error);
          estado.textContent = 'No se pudo construir el modelo. Puedes consultar los comandos del ejercicio.';
        }
      },
    }, true);
    app.inject('visor');
  } catch {
    clearTimeout(temporizador);
    mostrarError();
  }
}

iniciarSimulador();
