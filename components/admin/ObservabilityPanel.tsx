'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Globe, 
  Monitor, 
  RefreshCw,
  Server,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HealthData {
  status: string
  timestamp: string
  uptime: number
  buildId: string
  environment: string
  storage: {
    mode: string
    healthy: boolean
  }
  performance: {
    responseTime: string
  }
  features: {
    i18n: boolean
    admin: boolean
    monitoring: boolean
    telemetry: boolean
  }
}

interface TelemetryData {
  totalEvents: number
  recentEvents: number
  eventTypes: {
    vitals: number
    errors: number
    navigation: number
  }
  vitalsData: Array<{
    name: string
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
  }>
  recentErrors: Array<{
    id: string
    timestamp: string
    message: string
    url: string
  }>
}

export function ObservabilityPanel() {
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [telemetryData, setTelemetryData] = useState<TelemetryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load health data
      const healthResponse = await fetch('/api/health')
      if (healthResponse.ok) {
        const health = await healthResponse.json()
        setHealthData(health)
      }

      // Load telemetry data
      const telemetryResponse = await fetch('/api/telemetry')
      if (telemetryResponse.ok) {
        const telemetry = await telemetryResponse.json()
        setTelemetryData(telemetry)
      }
    } catch (error) {
      console.error('Failed to load observability data:', error)
    } finally {
      setIsLoading(false)
      setLastRefresh(new Date())
    }
  }

  useEffect(() => {
    loadData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getVitalsColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-500'
      case 'needs-improvement': return 'text-yellow-500'
      case 'poor': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getVitalsBadge = (rating: string) => {
    switch (rating) {
      case 'good': return 'default'
      case 'needs-improvement': return 'secondary'
      case 'poor': return 'destructive'
      default: return 'outline'
    }
  }

  if (isLoading && !healthData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading observability data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Observability</h2>
          <p className="text-muted-foreground">System health and performance monitoring</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status */}
      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              {healthData.status === 'ok' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{healthData.status}</div>
              <p className="text-xs text-muted-foreground">
                Environment: {healthData.environment}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatUptime(healthData.uptime)}</div>
              <p className="text-xs text-muted-foreground">
                Since: {new Date(Date.now() - healthData.uptime * 1000).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage</CardTitle>
              <Database className={cn(
                'h-4 w-4',
                healthData.storage.healthy ? 'text-green-500' : 'text-red-500'
              )} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{healthData.storage.mode}</div>
              <p className="text-xs text-muted-foreground">
                Status: {healthData.storage.healthy ? 'Healthy' : 'Unhealthy'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthData.performance.responseTime}</div>
              <p className="text-xs text-muted-foreground">
                Health endpoint
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feature Status */}
      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Feature Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Internationalization</span>
                <Badge variant={healthData.features.i18n ? 'default' : 'secondary'}>
                  {healthData.features.i18n ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Admin Panel</span>
                <Badge variant={healthData.features.admin ? 'default' : 'secondary'}>
                  {healthData.features.admin ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Monitoring</span>
                <Badge variant={healthData.features.monitoring ? 'default' : 'secondary'}>
                  {healthData.features.monitoring ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Telemetry</span>
                <Badge variant={healthData.features.telemetry ? 'default' : 'secondary'}>
                  {healthData.features.telemetry ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Web Vitals */}
      {telemetryData && telemetryData.vitalsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Web Vitals (Last 24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {telemetryData.vitalsData
                .filter(vital => ['CLS', 'FID', 'LCP'].includes(vital.name))
                .map(vital => (
                  <div key={vital.name} className="text-center p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      {vital.name}
                    </div>
                    <div className={cn('text-2xl font-bold mb-2', getVitalsColor(vital.rating))}>
                      {vital.name === 'CLS' 
                        ? vital.value.toFixed(3)
                        : `${Math.round(vital.value)}${vital.name === 'LCP' ? 'ms' : 'ms'}`
                      }
                    </div>
                    <Badge variant={getVitalsBadge(vital.rating) as any} className="text-xs">
                      {vital.rating.replace('-', ' ')}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Summary */}
      {telemetryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Event Summary (Last 24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Events</span>
                  <Badge variant="outline">{telemetryData.totalEvents}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recent Events</span>
                  <Badge variant="outline">{telemetryData.recentEvents}</Badge>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Web Vitals</span>
                    <span className="text-muted-foreground">{telemetryData.eventTypes.vitals}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Errors</span>
                    <span className={cn(
                      'text-muted-foreground',
                      telemetryData.eventTypes.errors > 0 && 'text-red-500 font-medium'
                    )}>
                      {telemetryData.eventTypes.errors}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Navigation</span>
                    <span className="text-muted-foreground">{telemetryData.eventTypes.navigation}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Errors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Recent Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {telemetryData.recentErrors.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No errors in the last 24 hours</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {telemetryData.recentErrors.map(error => (
                    <div key={error.id} className="border-l-2 border-red-500 pl-3 py-2">
                      <div className="text-sm font-medium text-red-600">
                        {error.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {error.url} • {new Date(error.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Build Information */}
      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Build Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Build ID:</span>
                <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">
                  {healthData.buildId}
                </code>
              </div>
              
              <div>
                <span className="font-medium">Environment:</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {healthData.environment}
                </Badge>
              </div>
              
              <div>
                <span className="font-medium">Last Health Check:</span>
                <span className="ml-2 text-muted-foreground">
                  {new Date(healthData.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}