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
    status200: [],
    status300: [],
    status400: [],
    status500: [],
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
          
          // Extract status codes from by_status_15m
          const statusCounts = data.totals?.by_status_15m || {}
          const getStatusCount = (code) => {
            // Count all status codes in the range
            let count = 0
            for (const [status, value] of Object.entries(statusCounts)) {
              const statusNum = parseInt(status)
              if (code === 200 && statusNum >= 200 && statusNum < 300) count += value
              else if (code === 300 && statusNum >= 300 && statusNum < 400) count += value
              else if (code === 400 && statusNum >= 400 && statusNum < 500) count += value
              else if (code === 500 && statusNum >= 500) count += value
            }
            return count
          }
          
          // Get total counts for each status code range (rolling 15m window)
          const status200Count = getStatusCount(200)
          const status300Count = getStatusCount(300)
          const status400Count = getStatusCount(400)
          const status500Count = getStatusCount(500)
          
          setMetricsHistory(prev => {
            const newHistory = {
              ...prev,
              requests: [...prev.requests, data.last_1m.requests || 0],
              responseTime: [...prev.responseTime, data.last_1m.avg_response_ms || 0],
              status200: [...prev.status200, status200Count],
              status300: [...prev.status300, status300Count],
              status400: [...prev.status400, status400Count],
              status500: [...prev.status500, status500Count],
              timestamps: [...prev.timestamps, timeLabel]
            }
            
            // Giới hạn số điểm dữ liệu
            if (newHistory.timestamps.length > maxDataPoints) {
              newHistory.requests.shift()
              newHistory.responseTime.shift()
              newHistory.status200.shift()
              newHistory.status300.shift()
              newHistory.status400.shift()
              newHistory.status500.shift()
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
                // Also limit status codes if they exist
                if (newHistory.status200.length > maxDataPoints) {
                  newHistory.status200.shift()
                  newHistory.status300.shift()
                  newHistory.status400.shift()
                  newHistory.status500.shift()
                }
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

  // Helper function to get status level (normal, warning, danger)
  const getStatusLevel = (value, thresholds) => {
    if (value >= thresholds.danger) return 'danger'
    if (value >= thresholds.warning) return 'warning'
    return 'normal'
  }

  // Helper function to get color based on status
  const getStatusColor = (status, type) => {
    if (status === 'danger') {
      if (type === 'cpu') return 'from-red-600 to-red-700'
      if (type === 'memory') return 'from-red-600 to-red-700'
      if (type === 'disk') return 'from-red-600 to-red-700'
      return 'from-red-600 to-red-700'
    }
    if (status === 'warning') {
      if (type === 'cpu') return 'from-orange-600 to-orange-700'
      if (type === 'memory') return 'from-yellow-600 to-yellow-700'
      if (type === 'disk') return 'from-orange-600 to-orange-700'
      return 'from-yellow-600 to-yellow-700'
    }
    // normal
    if (type === 'cpu') return 'from-orange-600 to-orange-700'
    if (type === 'memory') return 'from-green-600 to-green-700'
    if (type === 'disk') return 'from-purple-600 to-purple-700'
    return 'from-blue-700 to-blue-800'
  }

  const Tile = ({ title, value, unit, color, status, statusType }) => {
    const displayColor = status ? getStatusColor(status, statusType) : color
    const statusBadge = status === 'danger' ? '🔴' : status === 'warning' ? '🟡' : null
    
    return (
      <div className={`rounded-xl p-5 bg-gradient-to-br ${displayColor} text-white shadow-inner relative`}>
        {statusBadge && (
          <div className="absolute top-2 right-2 text-xl">{statusBadge}</div>
        )}
      <div className="text-sm opacity-80 mb-2">{title}</div>
      <div className="text-3xl font-extrabold tracking-tight">{value}{unit ? <span className="text-base ml-1 opacity-80">{unit}</span> : null}</div>
        {status === 'danger' && (
          <div className="text-xs mt-2 opacity-90 font-semibold">⚠️ Nguy hiểm</div>
        )}
        {status === 'warning' && (
          <div className="text-xs mt-2 opacity-90">⚠️ Cảnh báo</div>
        )}
    </div>
  )
  }

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
          <p className="text-gray-400 text-sm">Tự cập nhật mỗi 5 giây • giao diện kiểu grafana nhưng dữ liệu sync bên railway</p>
        </div>
        {metrics && (
          <div className="text-gray-400 text-sm">Cập nhật lúc {new Date(metrics.generated_at*1000).toLocaleTimeString()}</div>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

      {/* Alert Banner for Critical Thresholds */}
      {metrics && systemMetrics && (() => {
        const alerts = []
        const cpuPercent = systemMetrics.cpu?.percent || 0
        const memoryPercent = systemMetrics.memory?.percent || 0
        const diskPercent = systemMetrics.disk?.percent || 0
        const responseTime = metrics.last_1m?.avg_response_ms || 0
        const totalRequests = metrics.totals?.requests_15m || 0
        const error5xx = metricsHistory.status500[metricsHistory.status500.length - 1] || 0
        const error5xxPercent = totalRequests > 0 ? (error5xx / totalRequests) * 100 : 0

        if (cpuPercent >= 90) {
          alerts.push({ type: 'danger', message: `CPU sử dụng ${cpuPercent.toFixed(1)}% - Nguy hiểm! Server có thể bị chậm hoặc crash.` })
        } else if (cpuPercent >= 70) {
          alerts.push({ type: 'warning', message: `CPU sử dụng ${cpuPercent.toFixed(1)}% - Cảnh báo!` })
        }

        if (memoryPercent >= 90) {
          alerts.push({ type: 'danger', message: `Memory sử dụng ${memoryPercent.toFixed(1)}% - Nguy hiểm! Có thể gây lỗi out-of-memory.` })
        } else if (memoryPercent >= 70) {
          alerts.push({ type: 'warning', message: `Memory sử dụng ${memoryPercent.toFixed(1)}% - Cảnh báo!` })
        }

        if (diskPercent >= 90) {
          alerts.push({ type: 'danger', message: `Disk sử dụng ${diskPercent.toFixed(1)}% - Nguy hiểm! Không thể lưu file mới, DB có thể lỗi.` })
        } else if (diskPercent >= 80) {
          alerts.push({ type: 'warning', message: `Disk sử dụng ${diskPercent.toFixed(1)}% - Cảnh báo!` })
        }

        if (responseTime > 1000) {
          alerts.push({ type: 'danger', message: `Response time ${responseTime.toFixed(0)}ms - Nguy hiểm! User trải nghiệm xấu.` })
        } else if (responseTime > 500) {
          alerts.push({ type: 'warning', message: `Response time ${responseTime.toFixed(0)}ms - Cảnh báo!` })
        }

        if (error5xxPercent > 2) {
          alerts.push({ type: 'danger', message: `5xx errors: ${error5xxPercent.toFixed(1)}% (${error5xx} requests) - Nguy hiểm! Server đang gặp lỗi.` })
        } else if (error5xxPercent > 1) {
          alerts.push({ type: 'warning', message: `5xx errors: ${error5xxPercent.toFixed(1)}% (${error5xx} requests) - Cảnh báo!` })
        }

        if (alerts.length === 0) return null

        return (
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`rounded-lg border px-4 py-3 text-sm ${
                  alert.type === 'danger'
                    ? 'bg-red-50 border-red-300 text-red-800'
                    : 'bg-yellow-50 border-yellow-300 text-yellow-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{alert.type === 'danger' ? '🔴' : '🟡'}</span>
                  <span className="font-semibold">{alert.message}</span>
                </div>
              </div>
            ))}
          </div>
        )
      })()}

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
          {systemMetrics && (() => {
            const cpuPercent = systemMetrics.cpu?.percent || 0
            const memoryPercent = systemMetrics.memory?.percent || 0
            const diskPercent = systemMetrics.disk?.percent || 0
            
            const cpuStatus = getStatusLevel(cpuPercent, { warning: 70, danger: 90 })
            const memoryStatus = getStatusLevel(memoryPercent, { warning: 70, danger: 90 })
            const diskStatus = getStatusLevel(diskPercent, { warning: 80, danger: 90 })
            
            return (
              <div className="grid md:grid-cols-3 gap-4">
                <Tile 
                  title="CPU Usage" 
                  value={cpuPercent.toFixed(1)} 
                  unit="%" 
                  status={cpuStatus}
                  statusType="cpu"
                />
                <Tile 
                  title="Memory Usage" 
                  value={memoryPercent.toFixed(1)} 
                  unit="%" 
                  status={memoryStatus}
                  statusType="memory"
                />
                <Tile 
                  title="Disk Usage" 
                  value={diskPercent.toFixed(1)} 
                  unit="%" 
                  status={diskStatus}
                  statusType="disk"
                />
              </div>
            )
          })()}

          {/* Charts - Railway Style */}
          {metricsHistory.timestamps.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
              {/* HTTP Status Codes Chart */}
              <Card title="HTTP Status Codes (15m)">
                <div style={{ height: '240px', position: 'relative' }}>
                  <Line
                    data={{
                      labels: metricsHistory.timestamps,
                      datasets: [
                        {
                          label: '2xx Success',
                          data: metricsHistory.status200,
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
                          label: '3xx Redirect',
                          data: metricsHistory.status300,
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          fill: true,
                          tension: 0.5,
                          borderWidth: 2,
                          pointRadius: 0,
                          pointHoverRadius: 5,
                          pointHoverBorderWidth: 2
                        },
                        {
                          label: '4xx Client Error',
                          data: metricsHistory.status400,
                          borderColor: 'rgb(251, 191, 36)',
                          backgroundColor: 'rgba(251, 191, 36, 0.15)',
                          fill: true,
                          tension: 0.5,
                          borderWidth: 2,
                          pointRadius: 0,
                          pointHoverRadius: 5,
                          pointHoverBorderWidth: 2
                        },
                        {
                          label: '5xx Server Error',
                          data: metricsHistory.status500,
                          borderColor: 'rgb(239, 68, 68)',
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
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
                      beginAtZero: true
                    })}
                  />
                </div>
              </Card>
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
              <Card title="Response Time (ms)">
                <div className="space-y-2">
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
                          pointHoverBorderWidth: 2,
                          segment: {
                            borderColor: (ctx) => {
                              const value = ctx.p1.parsed.y
                              if (value > 1000) return 'rgb(239, 68, 68)' // Red for danger
                              if (value > 500) return 'rgb(251, 191, 36)' // Yellow for warning
                              return 'rgb(236, 72, 153)' // Pink for normal
                            }
                          }
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
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1">
                      <span>🟢</span>
                      <span>&lt; 500ms: Bình thường</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🟡</span>
                      <span>500-1000ms: Cảnh báo</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🔴</span>
                      <span>&gt; 1000ms: Nguy hiểm</span>
                    </div>
                  </div>
              </div>
            </Card>
          </div>
          )}

          <Card title="HTTP Status Details (15m)">
            <div className="flex flex-wrap gap-2">
              {Object.entries(metrics.totals.by_status_15m)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([code, count]) => {
                  const codeNum = parseInt(code)
                  let colorClass = 'bg-white/10'
                  if (codeNum >= 200 && codeNum < 300) colorClass = 'bg-green-500/20 border border-green-500/30'
                  else if (codeNum >= 300 && codeNum < 400) colorClass = 'bg-blue-500/20 border border-blue-500/30'
                  else if (codeNum >= 400 && codeNum < 500) colorClass = 'bg-yellow-500/20 border border-yellow-500/30'
                  else if (codeNum >= 500) colorClass = 'bg-red-500/20 border border-red-500/30'
                  
                  return (
                    <div key={code} className={`px-3 py-1.5 rounded-lg ${colorClass} text-sm`}>
                  <span className="font-semibold">{code}</span>
                  <span className="opacity-80"> · {count}</span>
                </div>
                  )
                })}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
