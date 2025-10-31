import React, { useEffect, useState } from 'react'
import { getAdminMetrics } from '../api'

export default function AdminMonitor(){
  const [metrics, setMetrics] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    let timer

    const fetchMetrics = async () => {
      try{
        const data = await getAdminMetrics()
        if(isMounted) setMetrics(data)
        setError('')
      }catch(err){
        if(isMounted) setError(err?.data?.error || 'Không lấy được metrics')
      }
    }

    fetchMetrics()
    timer = setInterval(fetchMetrics, 5000)
    return () => { isMounted = false; clearInterval(timer) }
  }, [])

  const Tile = ({ title, value, unit, color='from-gray-700 to-gray-800' }) => (
    <div className={`rounded-xl p-5 bg-gradient-to-br ${color} text-white shadow-inner`}>
      <div className="text-sm opacity-80 mb-2">{title}</div>
      <div className="text-3xl font-extrabold tracking-tight">{value}{unit ? <span className="text-base ml-1 opacity-80">{unit}</span> : null}</div>
    </div>
  )

  const Card = ({ title, children }) => (
    <div className="bg-[#1f2937] text-gray-100 rounded-xl shadow border border-white/5 p-5">
      <div className="font-semibold mb-3 opacity-90">{title}</div>
      {children}
    </div>
  )

  return (
    <div className="space-y-6 bg-[#0b1220] -mx-6 px-6 py-4 rounded-xl">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">📊 Tổng quan hệ thống</h2>
          <p className="text-gray-400 text-sm">Tự cập nhật mỗi 5 giây • giao diện kiểu Grafana</p>
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
          <div className="grid md:grid-cols-4 gap-4">
            <Tile title="Requests (15m)" value={metrics.totals.requests_15m} color="from-indigo-700 to-indigo-800" />
            <Tile title="Users online (logged-in)" value={metrics.totals.online_users_1m} color="from-emerald-700 to-emerald-800" />
            <Tile title="Active users (15m)" value={metrics.totals.active_users_15m} color="from-sky-700 to-sky-800" />
            <Tile title="Errors (1m)" value={metrics.last_1m.errors} color="from-rose-700 to-rose-800" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card title="Last 1 minute">
              <div className="grid grid-cols-2 gap-3">
                <Tile title="Requests" value={metrics.last_1m.requests} />
                <Tile title="Avg response" value={metrics.last_1m.avg_response_ms.toFixed(1)} unit="ms" />
                <Tile title="p95 response" value={metrics.last_1m.p95_response_ms.toFixed(1)} unit="ms" />
              </div>
            </Card>
            <Card title="Last 5 minutes">
              <div className="grid grid-cols-2 gap-3">
                <Tile title="Requests" value={metrics.last_5m.requests} />
                <Tile title="Avg response" value={metrics.last_5m.avg_response_ms.toFixed(1)} unit="ms" />
                <Tile title="p95 response" value={metrics.last_5m.p95_response_ms.toFixed(1)} unit="ms" />
              </div>
            </Card>
          </div>

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


