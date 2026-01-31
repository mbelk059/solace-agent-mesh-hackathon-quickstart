import { NextResponse } from 'next/server';

/**
 * Health check endpoint to verify SAM backend is running
 * Checks if SAM gateway is accessible on port 8000
 * SAM FastAPI gateway typically exposes /docs, /openapi.json endpoints
 * 
 * IMPORTANT: This checks the SAM webui gateway, NOT the Solace broker.
 * The broker runs on port 8080, but SAM gateway runs on port 8000.
 */
export async function GET() {
  const samGatewayUrl = process.env.SAM_GATEWAY_URL || 'http://localhost:8000';
  
  // Try multiple endpoints that SAM gateway might expose
  const endpointsToTry = [
    '/docs',           // FastAPI docs endpoint (most reliable)
    '/openapi.json',   // OpenAPI spec
    '/health',         // Health endpoint (if exists)
    '/',               // Root endpoint
  ];

  // First, try to connect to SAM gateway
  for (const endpoint of endpointsToTry) {
    try {
      const response = await fetch(`${samGatewayUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/html, */*',
        },
        // Short timeout - if SAM isn't running, fail fast
        signal: AbortSignal.timeout(2000),
      });

      // If we get any HTTP response (even 404, 405, etc.), SAM gateway is running
      // Only fail if we get a connection error (ECONNREFUSED, etc.)
      // But we need to be careful - Next.js dev server might respond on 8000 too
      // So we check for specific SAM gateway responses
      if (response.status >= 200 && response.status < 500) {
        // Additional check: if it's the /docs endpoint, verify it's actually FastAPI/SAM
        // by checking if the response contains FastAPI indicators
        if (endpoint === '/docs') {
          const text = await response.text();
          // FastAPI docs page contains these indicators
          if (text.includes('FastAPI') || text.includes('Swagger') || text.includes('openapi')) {
            return NextResponse.json({ 
              status: 'healthy', 
              sam_running: true,
              gateway_url: samGatewayUrl,
              checked_endpoint: endpoint
            });
          }
          // If /docs doesn't look like FastAPI, continue to next endpoint
          continue;
        }
        
        // For other endpoints, accept the response
        return NextResponse.json({ 
          status: 'healthy', 
          sam_running: true,
          gateway_url: samGatewayUrl,
          checked_endpoint: endpoint
        });
      }
    } catch (error: any) {
      // Connection error (ECONNREFUSED, timeout, etc.) - try next endpoint
      // Don't fail yet, try other endpoints first
      continue;
    }
  }

  // None of the endpoints responded - SAM gateway is not running
  // Note: Solace broker on port 8080 is NOT the same as SAM gateway on port 8000
  return NextResponse.json({ 
    status: 'unhealthy', 
    sam_running: false,
    error: 'SAM gateway is not accessible on port 8000. Please ensure SAM backend is running with: uv run sam run configs/',
    gateway_url: samGatewayUrl,
    hint: 'Make sure configs/webui.yaml is included and the gateway starts successfully. Note: Solace broker (port 8080) is not the same as SAM gateway (port 8000).'
  }, { status: 503 });
}
