"use client"

import { useRef } from "react"
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
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

interface MiningChartProps {
  data: number[]
  labels: string[]
}

export const MiningChart = ({ data, labels }: MiningChartProps) => {
  const chartRef = useRef<ChartJS>(null)

  const chartData = {
    labels,
    datasets: [
      {
        fill: true,
        label: "Майнинг",
        data,
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
  }

  return (
    <div className="bg-opacity-30 bg-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3">График майнинга</h3>
      <div className="h-[200px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}

