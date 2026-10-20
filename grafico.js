// =====================================================
//  GRÁFICO · INTEGRIDAD (p5.js)
//  adentro afuera · Interludio: Martes
//  Tu frase se escribe, la máquina tacha lo que "sobra",
//  aparece la versión corregida y se repite.
//  Tamaño: 560 × 470 (el recuadro superior derecho del diseño)
// =====================================================

// ---------- 1. EDITA AQUÍ LAS DOS VERSIONES ----------
const ORIGINAL  = 'Le escribo con cariño y algo de cansancio para solicitar el préstamo del fondo.';
const TACHADAS  = ['con', 'cariño', 'y', 'algo', 'de', 'cansancio'];   // palabras que se pierden
const CORREGIDA = 'Me permito respetuosamente solicitar el préstamo del fondo.';
const RESALTADA = 'respetuosamente';                                    // palabra que agregó la máquina
const BALANCE   = '− 6 palabras · + 1 palabra · tono: cansancio → protocolo';

// ---------- 2. RITMO (en segundos) ----------
const T = {
  escribir: 0.25,   // segundos por palabra al escribir
  tachar:   0.45,   // segundos por palabra al tachar
  pausa:    1.0,    // pausa entre fases
  final:    4.0     // tiempo quieto al final antes de repetir
};

// ---------- No hace falta tocar nada de aquí para abajo ----------
const W = 560, H = 470;
const C = {
  paper: '#F4F1EA', ink: '#1A1A1A', grey: '#8A8A8A', label: '#555555',
  teal: '#035B66', tealDk: '#02414A', mark: '#BFE3E8', red: '#C0392B'
};
const FONT = 'IBM Plex Mono';
const X = 30, MAXW = W - 60, SIZE = 22, LEAD = 32;

let palabras1, palabras2, fases, total, t0, escala = 1;

function setup() {
  // carga la tipografía desde Google Fonts (no hace falta tocar index.html)
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap';
  document.head.appendChild(link);
  document.body.style.margin = '0';
  document.body.style.background = C.paper;

  createCanvas(10, 10);
  ajustar();

  palabras1 = ORIGINAL.split(' ');
  palabras2 = CORREGIDA.split(' ');
  const pendientes = TACHADAS.slice();
  // marca qué palabras del original se tachan (en orden)
  palabras1 = palabras1.map(w => {
    const limpia = w.replace(/[.,;:]/g, '');
    const i = pendientes.indexOf(limpia);
    if (i === 0) { pendientes.shift(); return { w, tacha: true }; }
    return { w, tacha: false };
  });
  palabras2 = palabras2.map(w => ({ w, marca: w.replace(/[.,;:]/g, '') === RESALTADA }));

  // línea de tiempo de la animación
  const nTach = palabras1.filter(p => p.tacha).length;
  fases = {};
  let t = 0.6;
  fases.escribir1 = [t, t += palabras1.length * T.escribir];
  t += T.pausa;
  fases.tachar = [t, t += nTach * T.tachar];
  t += T.pausa;
  fases.escribir2 = [t, t += palabras2.length * T.escribir];
  fases.resaltar = [t, t += 1.0];
  t += 0.5;
  fases.balance = [t, t += 1.2];
  total = t + T.final;
  t0 = millis();
}

function ajustar() {
  escala = Math.min(windowWidth / W, windowHeight / H);
  resizeCanvas(Math.floor(W * escala), Math.floor(H * escala));
}
function windowResized() { ajustar(); }

// avance 0 → 1 dentro de una fase
function avance(f, t) { return constrain((t - f[0]) / (f[1] - f[0]), 0, 1); }

// dibuja palabras con salto de línea; devuelve la y final
function dibujarPalabras(lista, y, cuantas, extra) {
  textFont(FONT); textSize(SIZE); textAlign(LEFT, TOP);
  const esp = textWidth(' ');
  let x = X;
  const total = Math.floor(cuantas);
  lista.forEach((p, i) => {
    const w = textWidth(p.w);
    if (x + w > X + MAXW) { x = X; y += LEAD; }
    if (i < total) extra(p, i, x, y, w);
    x += w + esp;
  });
  return y + LEAD;
}

function draw() {
  scale(escala);
  background(C.paper);
  const t = ((millis() - t0) / 1000) % total;

  // fundido al final de cada vuelta
  const salida = constrain((total - t) / 0.6, 0, 1);

  textFont(FONT); noStroke();
  fill(C.teal); textSize(18); textAlign(LEFT, TOP);
  text('GRÁFICO · INTEGRIDAD (p5.js)', X, 28);

  // ---- versión 1: lo que escribí ----
  fill(C.label); textSize(15); text('v1 · lo que escribí', X, 70);
  const n1 = avance(fases.escribir1, t) * palabras1.length;
  const nTach = palabras1.filter(p => p.tacha).length;
  const progTach = avance(fases.tachar, t) * nTach;   // cuántas palabras van tachadas
  let k = 0;
  let y = dibujarPalabras(palabras1, 104, n1, (p, i, x, y, w) => {
    let col = color(C.ink);
    if (p.tacha) {
      const parte = constrain(progTach - k, 0, 1);    // 0 → 1 para esta palabra
      k++;
      col = lerpColor(color(C.ink), color(C.grey), parte);
      fill(col); text(p.w, x, y);
      if (parte > 0) {
        stroke(C.red); strokeWeight(3);
        line(x, y + SIZE * 0.55, x + w * parte, y + SIZE * 0.55);
        noStroke();
      }
    } else { fill(col); text(p.w, x, y); }
  });

  // ---- versión 2: lo que salió ----
  if (t >= fases.escribir2[0] - 0.4) {
    fill(C.label); textSize(15); textAlign(LEFT, TOP);
    text('v2 · lo que salió', X, y + 22);
    const n2 = avance(fases.escribir2, t) * palabras2.length;
    const res = avance(fases.resaltar, t);
    y = dibujarPalabras(palabras2, y + 56, n2, (p, i, x, yy, w) => {
      if (p.marca && res > 0) { fill(C.mark); rect(x - 3, yy - 2, (w + 6) * res, SIZE + 8); }
      fill(p.marca ? C.tealDk : C.ink); text(p.w, x, yy);
    });
  }

  // ---- balance ----
  const b = avance(fases.balance, t);
  if (b > 0) {
    fill(red(color(C.red)), green(color(C.red)), blue(color(C.red)), 255 * b);
    textSize(15); textAlign(LEFT, TOP);
    text(BALANCE, X, y + 20);
  }

  // cursor que parpadea mientras se escribe
  const escribiendo = (t > fases.escribir1[0] && t < fases.escribir1[1]) || (t > fases.escribir2[0] && t < fases.escribir2[1]);
  if (escribiendo && frameCount % 30 < 18) { fill(C.teal); rect(W - 44, 30, 10, 18); }

  // fundido de salida
  if (salida < 1) { fill(244, 241, 234, 255 * (1 - salida)); rect(0, 0, W, H); }
}

// R reinicia la animación
function keyPressed() { if (key === 'r' || key === 'R') t0 = millis(); }
