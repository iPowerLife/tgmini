"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js"

// Регистрируем необходимые компоненты Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend)

export const MiningChart = ({ data = [], labels = [], title = "График майнинга" }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color: "#fff",
        font: {
          size: 16,
        },
        padding: {
          bottom: 15,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context) => `Доход: ${context.parsed.y} 💎`,
        },
        backgroundColor: "rgba(30, 41, 59, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(148, 163, 184, 0.2)",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 12,
          },
          callback: (value) => value + " 💎",
        },
        min: 0,
        suggestedMax: Math.max(...data) * 1.1,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    elements: {
      line: {
        tension: 0.3,
        borderWidth: 2,
        borderColor: "rgba(59, 130, 246, 0.8)",
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
      },
      point: {
        radius: 0,
        hoverRadius: 6,
        backgroundColor: "#3b82f6",
        borderColor: "#fff",
        borderWidth: 2,
        hoverBorderWidth: 2,
      },
    },
  }

  const chartData = {
    labels,
    datasets: [
      {
        data,
        borderColor: "rgba(59, 130, 246, 0.8)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
      },
    ],
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4">
      <div className="h-[200px]">
        <Line options={options} data={chartData} />
      </div>
      <div className="mt-2 text-center text-xs text-gray-400">
        График показывает ваш доход от майнинга за последние 8 дней
      </div>
    </div>
  )
}

export default MiningChart

