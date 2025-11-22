import React, { useEffect, useState } from 'react'
import { getAdminMetrics, getAdminStatistics } from '../api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function AdminMonitor(){
  const [metrics, setMetrics] = useState(null)
  const [systemMetrics, setSystemMetrics] = useState(null)
  const [error, setError] = useState('')
  const [metricsHistory, setMetricsHistory] = useState({
    cpu: [],
    memory: [],
    disk: [],
    requests: [],
    responseTime: [],
    timestamps: []
  })
  const maxDataPoints = 60 // Lưu 60 điểm dữ liệu (5 phút nếu fetch mỗi 5 giây)

  useEffect(() => {
    let isMounted = true
    let timer

    const fetchMetrics = async () => {
      try{
        // Fetch runtime metrics
        const data = await getAdminMetrics()
        if(isMounted) {
          setMetrics(data)
          
          // Add to history
          const now = new Date()
          const timeLabel = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          
          setMetricsHistory(prev => {
            const newHistory = {
              ...prev,
              requests: [...prev.requests, data.last_1m.requests || 0],
              responseTime: [...prev.responseTime, data.last_1m.avg_response_ms || 0],
              timestamps: [...prev.timestamps, timeLabel]
            }
            
            // Giới hạn số điểm dữ liệu
            if (newHistory.timestamps.length > maxDataPoints) {
              newHistory.requests.shift()
              newHistory.responseTime.shift()
              newHistory.timestamps.shift()
            }
            
            return newHistory
          })
        }
        
        // Fetch system metrics (CPU, Memory, Disk)
        try {
          const statsData = await getAdminStatistics()
          if (isMounted && statsData.metrics && statsData.metrics.system && !statsData.metrics.system.error) {
            const sysMetrics = statsData.metrics.system
            setSystemMetrics(sysMetrics)
            
            // Add system metrics to history
            setMetricsHistory(prev => {
              const newHistory = {
                ...prev,
                cpu: [...prev.cpu, sysMetrics.cpu?.percent || 0],
                memory: [...prev.memory, sysMetrics.memory?.percent || 0],
                disk: [...prev.disk, sysMetrics.disk?.percent || 0]
              }
              
              // Giới hạn số điểm dữ liệu
              if (newHistory.cpu.length > maxDataPoints) {
                newHistory.cpu.shift()
                newHistory.memory.shift()
                newHistory.disk.shift()
              }
              
              return newHistory
            })
          }
        } catch (err) {
          console.error('[AdminMonitor] Error fetching system metrics:', err)
        }
        
        setError('')
      }catch(err){
        if(isMounted) setError(err?.data?.error || 'Không lấy được metrics')
      }
    }

    fetchMetrics()
    timer = setInterval(fetchMetrics, 5000)
    return () => { isMounted = false; clearInterval(timer) }
  }, [maxDataPoints])

  const Tile = ({ title, value, unit, color='from-gray-700 to-gray-800' }) => (
    <div className={`rounded-xl p-5 bg-gradient-to-br ${color} text-white shadow-inner`}>
      <div className="text-sm opacity-80 mb-2">{title}</div>
      <div className="text-3xl font-extrabold tracking-tight">{value}{unit ? <span className="text-base ml-1 opacity-80">{unit}</span> : null}</div>
    </div>
  )

  const Card = ({ title, children }) => (
    <div className="bg-[#1f2937] text-gray-100 rounded-xl shadow border border-white/5 p-5 overflow-hidden">
      <div className="font-semibold mb-3 opacity-90">{title}</div>
      <div className="overflow-hidden">
        {children}
      </div>
    </div>
  )

  // Chart options giống Railway - clean và professional
  const createChartOptions = (yAxisConfig = {}) => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    animation: {
      duration: 0
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: { size: 11, weight: '500' },
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 12, weight: '600' },
        bodyFont: { size: 11 },
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(1)
              if (yAxisConfig.unit) {
                label += yAxisConfig.unit
              }
            }
            return label
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: { size: 10 },
          maxRotation: 0,
          minRotation: 0,
          maxTicksLimit: 8,
          padding: 8
        },
        border: {
          display: false
        }
      },
      y: {
        display: true,
        beginAtZero: yAxisConfig.beginAtZero !== false,
        max: yAxisConfig.max,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: { size: 10 },
          padding: 8,
          callback: yAxisConfig.callback || function(value) {
            return value
          }
        },
        border: {
          display: false
        }
      }
    }
  })

  return (
    <div className="space-y-6 bg-[#0b1220] -mx-6 px-6 py-4 rounded-xl">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">📊 Tổng quan hệ thống</h2>
          <p className="text-gray-400 text-sm">Tự cập nhật mỗi 5 giây • giao diện kiểu Railway</p>
        </div>
        {metrics && (
          <div className="text-gray-400 text-sm">Cập nhật lúc {new Date(metrics.generated_at*1000).toLocaleTimeString()}</div>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

      {!metrics ? (
        <div className="text-gray-400">Đang tải...</div>
      ) : (
        <>
          {/* Runtime Metrics Tiles */}
          <div className="grid md:grid-cols-4 gap-4">
            <Tile title="Requests (15m)" value={metrics.totals.requests_15m} color="from-blue-700 to-blue-800" />
            <Tile title="Users online (logged-in)" value={metrics.totals.online_users_1m} color="from-blue-700 to-blue-800" />
            <Tile title="Active users (15m)" value={metrics.totals.active_users_15m} color="from-blue-700 to-blue-800" />
            <Tile title="Errors (1m)" value={metrics.last_1m.errors} color="from-blue-700 to-blue-800" />
          </div>

          {/* System Metrics Tiles */}
          {systemMetrics && (
            <div className="grid md:grid-cols-3 gap-4">
              <Tile 
                title="CPU Usage" 
                value={systemMetrics.cpu?.percent?.toFixed(1) || '0'} 
                unit="%" 
                color="from-orange-600 to-orange-700" 
              />
              <Tile 
                title="Memory Usage" 
                value={systemMetrics.memory?.percent?.toFixed(1) || '0'} 
                unit="%" 
                color="from-green-600 to-green-700" 
              />
              <Tile 
                title="Disk Usage" 
                value={systemMetrics.disk?.percent?.toFixed(1) || '0'} 
                unit="%" 
                color="from-purple-600 to-purple-700" 
              />
            </div>
          )}

          {/* Charts - Railway Style */}
          {metricsHistory.timestamps.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {/* System Resources Chart */}
              {systemMetrics && metricsHistory.cpu.length > 0 && (
                <Card title="System Resources">
                  <div style={{ height: '240px', position: 'relative' }}>
                    <Line
                      data={{
                        labels: metricsHistory.timestamps,
                        datasets: [
                          {
                            label: 'CPU',
                            data: metricsHistory.cpu,
                            borderColor: 'rgb(251, 146, 60)',
                            backgroundColor: 'rgba(251, 146, 60, 0.15)',
                            fill: true,
                            tension: 0.5,
                            borderWidth: 2,
                            pointRadius: 0,
                            pointHoverRadius: 5,
                            pointHoverBorderWidth: 2
                          },
                          {
                            label: 'Memory',
                            data: metricsHistory.memory,
                            borderColor: 'rgb(34, 197, 94)',
                            backgroundColor: 'rgba(34, 197, 94, 0.15)',
                            fill: true,
                            tension: 0.5,
                            borderWidth: 2,
                            pointRadius: 0,
                            pointHoverRadius: 5,
                            pointHoverBorderWidth: 2
                          },
                          {
                            label: 'Disk',
                            data: metricsHistory.disk,
                            borderColor: 'rgb(168, 85, 247)',
                            backgroundColor: 'rgba(168, 85, 247, 0.15)',
                            fill: true,
                            tension: 0.5,
                            borderWidth: 2,
                            pointRadius: 0,
                            pointHoverRadius: 5,
                            pointHoverBorderWidth: 2
                          }
                        ]
                      }}
                      options={createChartOptions({
                        beginAtZero: true,
                        max: 100,
                        unit: '%',
                        callback: function(value) {
                          return value + '%'
                        }
                      })}
                    />
                  </div>
                </Card>
              )}

              {/* Requests Chart */}
              <Card title="Requests">
                <div style={{ height: '240px', position: 'relative' }}>
                  <Line
                    data={{
                      labels: metricsHistory.timestamps,
                      datasets: [{
                        label: 'Requests/min',
                        data: metricsHistory.requests,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        fill: true,
                        tension: 0.5,
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBorderWidth: 2
                      }]
                    }}
                    options={createChartOptions({
                      beginAtZero: true
                    })}
                  />
                </div>
              </Card>

              {/* Response Time Chart */}
              <Card title="Response Time">
                <div style={{ height: '240px', position: 'relative' }}>
                  <Line
                    data={{
                      labels: metricsHistory.timestamps,
                      datasets: [{
                        label: 'Avg Response',
                        data: metricsHistory.responseTime,
                        borderColor: 'rgb(236, 72, 153)',
                        backgroundColor: 'rgba(236, 72, 153, 0.15)',
                        fill: true,
                        tension: 0.5,
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBorderWidth: 2
                      }]
                    }}
                    options={createChartOptions({
                      beginAtZero: true,
                      unit: 'ms',
                      callback: function(value) {
                        return value.toFixed(1) + 'ms'
                      }
                    })}
                  />
                </div>
              </Card>
            </div>
          )}

          <Card title="HTTP Status (15m)">
            <div className="flex flex-wrap gap-2">
              {Object.entries(metrics.totals.by_status_15m).map(([code, count]) => (
                <div key={code} className="px-3 py-1.5 rounded-lg bg-white/10 text-sm">
                  <span className="font-semibold">{code}</span>
                  <span className="opacity-80"> · {count}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
