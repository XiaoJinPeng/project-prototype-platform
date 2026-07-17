import { onBeforeUnmount } from 'vue';

export function useChartRegistry() {
  const charts = new Set();

  const resizeCharts = () => {
    charts.forEach((chart) => chart?.resize());
  };

  const registerChart = (chart) => {
    if (chart) charts.add(chart);
    return chart;
  };

  window.addEventListener('resize', resizeCharts);

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeCharts);
    charts.forEach((chart) => chart?.dispose());
    charts.clear();
  });

  return { registerChart };
}
