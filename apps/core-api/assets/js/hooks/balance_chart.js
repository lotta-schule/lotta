import Chart from '../../vendor/chart.js';

Chart.register(
  Chart.LineController,
  Chart.LineElement,
  Chart.PointElement,
  Chart.LinearScale,
  Chart.CategoryScale,
  Chart.Tooltip,
  Chart.Legend
);

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

// Reads a color the way it's actually rendered (resolving CSS vars, oklch(),
// Tailwind opacity modifiers, dark-mode overrides, …) by applying the given
// utility class to a throwaway element and asking the browser for the result.
function themeColor(className, property = 'color') {
  const el = document.createElement('div');
  el.className = className;
  el.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;';
  document.body.appendChild(el);
  const value = getComputedStyle(el)[property];
  document.body.removeChild(el);
  return value;
}

// Mirrors the theme resolution in lib/cockpit_web/components/layouts/root.html.heex:
// an explicit data-theme attribute wins, otherwise fall back to the OS preference.
function resolvedTheme() {
  const explicit = document.documentElement.getAttribute('data-theme');
  if (explicit === 'dark') return 'dark';
  if (explicit === 'light') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

// Fixed 8-hue categorical palette (identity encoding — never cycled per
// account past this ceiling; a 9th account repeating a color is a signal to
// revisit the chart form, not something to silently paper over).
const CATEGORICAL_PALETTE = [
  { light: '#2a78d6', dark: '#3987e5' }, // blue
  { light: '#1baf7a', dark: '#199e70' }, // aqua
  { light: '#eda100', dark: '#c98500' }, // yellow
  { light: '#008300', dark: '#008300' }, // green
  { light: '#4a3aa7', dark: '#9085e9' }, // violet
  { light: '#e34948', dark: '#e66767' }, // red
  { light: '#e87ba4', dark: '#d55181' }, // magenta
  { light: '#eb6834', dark: '#d95926' }, // orange
];

function categoricalColor(index) {
  const entry = CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length];
  return resolvedTheme() === 'dark' ? entry.dark : entry.light;
}

function buildDatasets(datasets) {
  let accountIndex = 0;

  return datasets.map((dataset) => {
    const isCombined = dataset.label === 'Combined';
    const color = isCombined
      ? themeColor('text-primary')
      : categoricalColor(accountIndex);
    if (!isCombined) accountIndex += 1;

    return {
      label: dataset.label,
      data: dataset.values,
      borderColor: color,
      backgroundColor: color,
      pointBackgroundColor: color,
      fill: false,
      tension: 0,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
    };
  });
}

function buildConfig({ labels, datasets }) {
  return {
    type: 'line',
    data: {
      labels,
      datasets: buildDatasets(datasets),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          labels: { color: themeColor('text-base-content/70') },
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${currencyFormatter.format(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: themeColor('text-base-content/60'), maxRotation: 0 },
        },
        y: {
          grid: { color: themeColor('text-base-content/10') },
          ticks: {
            color: themeColor('text-base-content/60'),
            callback: (value) => currencyFormatter.format(value),
          },
        },
      },
    },
  };
}

const BalanceChart = {
  mounted() {
    const chartData = JSON.parse(this.el.dataset.chart);
    this.chart = new Chart(this.el, buildConfig(chartData));

    this.themeObserver = new MutationObserver(() => this.repaint());
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  },

  updated() {
    const chartData = JSON.parse(this.el.dataset.chart);
    const config = buildConfig(chartData);

    this.chart.data = config.data;
    this.chart.update();
  },

  destroyed() {
    this.themeObserver?.disconnect();
    this.chart?.destroy();
  },

  repaint() {
    if (!this.chart) return;
    const chartData = JSON.parse(this.el.dataset.chart);
    this.chart.destroy();
    this.chart = new Chart(this.el, buildConfig(chartData));
  },
};

export default BalanceChart;
