// Mock service to load crisis data
// In production, this would connect to Solace topics or API endpoints

export async function getActionableCrises() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  try {
    // In production, fetch from API or Solace
    // For demo, we'll use the mock data file
    const response = await fetch('/data/crises/mock_actionable_crises.json')
    const data = await response.json()
    return {
      status: 'success',
      crises: data.crises || []
    }
  } catch (error) {
    console.error('Error loading crises:', error)
    return {
      status: 'error',
      message: error.message,
      crises: []
    }
  }
}

export function getSeverityColor(score) {
  if (score >= 9) return 'critical'
  if (score >= 7) return 'high'
  if (score >= 5) return 'medium'
  return 'low'
}

export function getSeverityLabel(score) {
  if (score >= 9) return 'Critical'
  if (score >= 7) return 'High'
  if (score >= 5) return 'Medium'
  return 'Low'
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export function formatTimeAgo(timestamp) {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now - then
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  }
  return 'Just now'
}
