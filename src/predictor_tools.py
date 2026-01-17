"""
Stock prediction tools using Alpha Vantage APIs.
Includes earnings estimates and news sentiment analysis.
"""
import requests
from typing import Optional, Dict, Any, List
from datetime import datetime


# TODO: Remove API key before pushing to GitHub!
DEFAULT_ALPHA_VANTAGE_KEY = ""  # ⚠️ REPLACE WITH YOUR KEY AND REMOVE BEFORE COMMIT


def get_earnings_estimates(
    symbol: str,
    alphavantage_api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get annual and quarterly EPS and revenue estimates for a stock.
    Includes analyst count and revision history.
    
    Args:
        symbol: Stock ticker symbol (e.g., 'IBM', 'AAPL')
        alphavantage_api_key: Your Alpha Vantage API key
        
    Returns:
        Dict containing earnings estimates data
        
    Example:
        >>> get_earnings_estimates("AAPL")
    """
    
    try:
        # Get API key
        api_key = alphavantage_api_key or DEFAULT_ALPHA_VANTAGE_KEY
        
        if not api_key:
            return {
                "error": "No Alpha Vantage API key provided",
                "success": False
            }
        
        # Clean symbol
        symbol = symbol.upper().strip()
        
        # Build request
        url = "https://www.alphavantage.co/query"
        params = {
            "function": "EARNINGS_ESTIMATES",
            "symbol": symbol,
            "apikey": api_key
        }
        
        # Make request
        response = requests.get(url, params=params, timeout=30)
        data = response.json()
        
        # Check for errors
        if "Error Message" in data:
            return {
                "error": data["Error Message"],
                "success": False,
                "symbol": symbol
            }
        
        if "Note" in data:
            return {
                "error": "API rate limit reached. Alpha Vantage allows 25 requests per day on free tier.",
                "note": data["Note"],
                "success": False,
                "symbol": symbol
            }
        
        # Parse response
        annual_estimates = data.get("annualEstimates", [])
        quarterly_estimates = data.get("quarterlyEstimates", [])
        
        result = {
            "success": True,
            "symbol": symbol,
            "annual_estimates": annual_estimates,
            "quarterly_estimates": quarterly_estimates,
            "annual_count": len(annual_estimates),
            "quarterly_count": len(quarterly_estimates)
        }
        
        # Add summary
        if annual_estimates:
            latest_annual = annual_estimates[0]
            result["latest_annual"] = {
                "fiscal_year": latest_annual.get("fiscalYear"),
                "eps_estimate": latest_annual.get("estimatedEPS"),
                "revenue_estimate": latest_annual.get("estimatedRevenue"),
                "analyst_count": latest_annual.get("numberOfAnalysts")
            }
        
        if quarterly_estimates:
            latest_quarterly = quarterly_estimates[0]
            result["latest_quarterly"] = {
                "fiscal_quarter": latest_quarterly.get("fiscalQuarter"),
                "eps_estimate": latest_quarterly.get("estimatedEPS"),
                "revenue_estimate": latest_quarterly.get("estimatedRevenue"),
                "analyst_count": latest_quarterly.get("numberOfAnalysts")
            }
        
        return result
        
    except requests.exceptions.RequestException as e:
        return {
            "error": f"Request failed: {str(e)}",
            "success": False,
            "error_type": "network"
        }
    except Exception as e:
        return {
            "error": f"Unexpected error: {str(e)}",
            "success": False,
            "error_type": "unknown"
        }


def get_news_sentiment(
    tickers: Optional[str] = None,
    topics: Optional[str] = None,
    time_from: Optional[str] = None,
    time_to: Optional[str] = None,
    sort: str = "LATEST",
    limit: int = 50,
    alphavantage_api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get market news and sentiment data for stocks, crypto, or forex.
    
    Args:
        tickers: Comma-separated ticker symbols (e.g., 'AAPL' or 'COIN,CRYPTO:BTC,FOREX:USD')
        topics: Comma-separated topics (e.g., 'technology,ipo'). 
                Available: blockchain, earnings, ipo, mergers_and_acquisitions, 
                financial_markets, economy_fiscal, economy_monetary, economy_macro,
                energy_transportation, finance, life_sciences, manufacturing,
                real_estate, retail_wholesale, technology
        time_from: Start time in YYYYMMDDTHHMM format (e.g., '20220410T0130')
        time_to: End time in YYYYMMDDTHHMM format
        sort: 'LATEST', 'EARLIEST', or 'RELEVANCE'
        limit: Number of results (1-1000, default 50)
        alphavantage_api_key: Your Alpha Vantage API key
        
    Returns:
        Dict containing news articles with sentiment scores
        
    Example:
        >>> get_news_sentiment("AAPL", limit=10)
        >>> get_news_sentiment(topics="technology,ipo", time_from="20240101T0000")
    """
    
    try:
        # Get API key
        api_key = alphavantage_api_key or DEFAULT_ALPHA_VANTAGE_KEY
        
        if not api_key:
            return {
                "error": "No Alpha Vantage API key provided",
                "success": False
            }
        
        # Build request
        url = "https://www.alphavantage.co/query"
        params = {
            "function": "NEWS_SENTIMENT",
            "apikey": api_key
        }
        
        # Add optional parameters
        if tickers:
            params["tickers"] = tickers.upper()
        if topics:
            params["topics"] = topics.lower()
        if time_from:
            params["time_from"] = time_from
        if time_to:
            params["time_to"] = time_to
        if sort:
            params["sort"] = sort.upper()
        if limit:
            params["limit"] = min(max(int(limit), 1), 1000)
        
        # Make request
        response = requests.get(url, params=params, timeout=30)
        data = response.json()
        
        # Check for errors
        if "Error Message" in data:
            return {
                "error": data["Error Message"],
                "success": False
            }
        
        if "Note" in data:
            return {
                "error": "API rate limit reached. Alpha Vantage allows 25 requests per day on free tier.",
                "note": data["Note"],
                "success": False
            }
        
        # Parse response
        feed = data.get("feed", [])
        
        result = {
            "success": True,
            "items": data.get("items"),
            "articles_count": len(feed),
            "feed": feed,
            "params_used": params
        }
        
        # Add sentiment summary
        if feed:
            sentiments = []
            for article in feed:
                overall_sentiment = article.get("overall_sentiment_score")
                if overall_sentiment is not None:
                    sentiments.append(float(overall_sentiment))
            
            if sentiments:
                avg_sentiment = sum(sentiments) / len(sentiments)
                result["sentiment_summary"] = {
                    "average_score": avg_sentiment,
                    "sentiment_label": (
                        "Bullish" if avg_sentiment > 0.15 else
                        "Somewhat Bullish" if avg_sentiment > 0.05 else
                        "Neutral" if avg_sentiment > -0.05 else
                        "Somewhat Bearish" if avg_sentiment > -0.15 else
                        "Bearish"
                    ),
                    "bullish_articles": sum(1 for s in sentiments if s > 0.15),
                    "bearish_articles": sum(1 for s in sentiments if s < -0.15),
                    "neutral_articles": sum(1 for s in sentiments if -0.15 <= s <= 0.15)
                }
        
        return result
        
    except requests.exceptions.RequestException as e:
        return {
            "error": f"Request failed: {str(e)}",
            "success": False,
            "error_type": "network"
        }
    except Exception as e:
        return {
            "error": f"Unexpected error: {str(e)}",
            "success": False,
            "error_type": "unknown"
        }


def analyze_prediction_signals(
    earnings_data: Dict[str, Any],
    news_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Combine earnings estimates and news sentiment to generate prediction signals.
    
    Args:
        earnings_data: Output from get_earnings_estimates
        news_data: Output from get_news_sentiment
        
    Returns:
        Dict containing prediction analysis
    """
    
    try:
        signals = {
            "timestamp": datetime.now().isoformat(),
            "signals": []
        }
        
        # Analyze earnings
        if earnings_data.get("success") and earnings_data.get("latest_quarterly"):
            quarterly = earnings_data["latest_quarterly"]
            signals["earnings_signal"] = {
                "eps_estimate": quarterly.get("eps_estimate"),
                "revenue_estimate": quarterly.get("revenue_estimate"),
                "analyst_count": quarterly.get("analyst_count"),
                "signal": "Positive" if quarterly.get("analyst_count", 0) > 10 else "Neutral"
            }
            signals["signals"].append("earnings")
        
        # Analyze sentiment
        if news_data.get("success") and news_data.get("sentiment_summary"):
            sentiment = news_data["sentiment_summary"]
            signals["sentiment_signal"] = {
                "average_score": sentiment.get("average_score"),
                "label": sentiment.get("sentiment_label"),
                "bullish_count": sentiment.get("bullish_articles", 0),
                "bearish_count": sentiment.get("bearish_articles", 0),
                "signal": sentiment.get("sentiment_label")
            }
            signals["signals"].append("sentiment")
        
        # Overall prediction
        if len(signals["signals"]) > 0:
            # Simple scoring
            score = 0
            if "earnings" in signals["signals"]:
                if signals["earnings_signal"]["signal"] == "Positive":
                    score += 1
            
            if "sentiment" in signals["signals"]:
                avg_sent = signals["sentiment_signal"]["average_score"]
                if avg_sent > 0.15:
                    score += 2
                elif avg_sent > 0.05:
                    score += 1
                elif avg_sent < -0.15:
                    score -= 2
                elif avg_sent < -0.05:
                    score -= 1
            
            signals["overall_prediction"] = {
                "score": score,
                "signal": (
                    "Strong Buy" if score >= 3 else
                    "Buy" if score >= 2 else
                    "Hold" if score >= 0 else
                    "Sell" if score >= -1 else
                    "Strong Sell"
                ),
                "confidence": "Medium" if len(signals["signals"]) >= 2 else "Low"
            }
        
        return signals
        
    except Exception as e:
        return {
            "error": f"Analysis failed: {str(e)}",
            "error_type": "analysis"
        }


# Test function
def test_apis(symbol: str = "AAPL"):
    """Test both APIs with a symbol"""
    print(f"Testing APIs for {symbol}...")
    
    print("\n1. Testing Earnings Estimates...")
    earnings = get_earnings_estimates(symbol)
    print(f"   Success: {earnings.get('success')}")
    if earnings.get('success'):
        print(f"   Latest EPS estimate: {earnings.get('latest_quarterly', {}).get('eps_estimate')}")
    else:
        print(f"   Error: {earnings.get('error')}")
    
    print("\n2. Testing News Sentiment...")
    news = get_news_sentiment(tickers=symbol, limit=5)
    print(f"   Success: {news.get('success')}")
    if news.get('success'):
        print(f"   Articles found: {news.get('articles_count')}")
        if news.get('sentiment_summary'):
            print(f"   Sentiment: {news['sentiment_summary']['sentiment_label']}")
    else:
        print(f"   Error: {news.get('error')}")
    
    print("\n3. Generating Prediction Signals...")
    signals = analyze_prediction_signals(earnings, news)
    if signals.get('overall_prediction'):
        pred = signals['overall_prediction']
        print(f"   Prediction: {pred['signal']} (confidence: {pred['confidence']})")
    
    return earnings, news, signals


if __name__ == "__main__":
    test_apis()