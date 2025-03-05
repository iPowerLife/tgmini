"use client"

import { useEffect, useState } from "react"
import { ArrowUp, Zap, Award, TrendingUp, Clock } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"

// Защита от свайпа вниз
const SwipeGuard = () => {
  return <div className="swipe-guard" />
}

// Компонент баланса с анимацией
const BalanceCard = ({ balance, currency = "COINS", power = 0 }) => {
  return (
    <div className="balance-card">
      <div className="balance-background"></div>
      <div className="balance-content">
        <div className="balance-label">Ваш баланс</div>
        <div className="balance-amount">
          {balance}
          <span className="balance-currency">{currency}</span>
        </div>
        <div className="mt-4 text-sm text-gray-400 flex items-center justify-center gap-2">
          <Zap size={16} className="text-blue-400" />
          <span>Мощность: {power} h/s</span>
        </div>
      </div>
    </div>
  )
}

// Компонент статистики
const StatsSection = ({ stats }) => {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

// Компонент активных майнеров
const ActiveMiners = ({ miners }) => {
  if (!miners || miners.length === 0) {
    return (
      <div className="bg-opacity-30 bg-gray-800 rounded-xl p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Zap size={18} className="text-blue-400" />
          Активные майнеры
        </h3>
        <div className="text-center py-4 text-gray-400">
          У вас пока нет майнеров. Посетите магазин, чтобы приобрести первого майнера!
        </div>
      </div>
    )
  }

  return (
    <div className="bg-opacity-30 bg-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Zap size={18} className="text-blue-400" />
        Активные майнеры
      </h3>
      <div className="space-y-3">
        {miners.map((miner, index) => (
          <div key={index} className="bg-opacity-40 bg-gray-700 rounded-lg p-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{miner.name}</div>
              <div className="text-sm text-gray-400">Уровень: {miner.level}</div>
            </div>
            <div className="text-right">
              <div className="text-blue-400 font-medium">{miner.power} h/s</div>
              <div className="text-xs text-gray-400">{miner.earnings}/час</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Компонент последних транзакций
const RecentTransactions = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-opacity-30 bg-gray-800 rounded-xl p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock size={18} className="text-blue-400" />
          Последние транзакции
        </h3>
        <div className="text-center py-4 text-gray-400">
          У вас пока нет транзакций. Начните майнить, чтобы увидеть историю транзакций!
        </div>
      </div>
    )
  }

  return (
    <div className="bg-opacity-30 bg-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Clock size={18} className="text-blue-400" />
        Последние транзакции
      </h3>
      <div className="space-y-2">
        {transaction
