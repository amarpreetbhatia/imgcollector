# Image Crawler Server - Sequence Diagram

```mermaid
sequenceDiagram
    participant Client as Frontend Client
    participant Server as Express Server
    participant Crawler as ImageCrawler
    participant Website as Target Website
    participant Robots as robots.txt

    Note over Client,Robots: Image Crawling Flow

    Client->>Server: POST /api/crawl { url }
    
    alt URL validation
        Server-->>Client: 400 Bad Request (if no URL)
    end

    Server->>Crawler: new ImageCrawler()
    Server->>Crawler: crawl(startUrl)
    
    Note over Crawler: Initialize state (startTime, foundImages, visitedUrls)
    
    Crawler->>Crawler: normalizeUrl(startUrl)
    Note over Crawler: Add https:// if missing
    
    Crawler->>Robots: checkRobotsTxt(normalizedUrl)
    Robots-->>Crawler: robots.txt content or 404
    
    alt Robots.txt disallows crawling
        Crawler-->>Server: { images: [], error: "Crawling not allowed" }
        Server-->>Client: JSON response with error
    end
    
    Note over Crawler: Start crawling at depth 0
    
    Crawler->>Crawler: crawlUrl(normalizedUrl, images, 0)
    
    loop For each URL to crawl
        alt Should stop crawling
            Note over Crawler: Check: foundImages >= 50 OR time >= 3min
            Crawler->>Crawler: return (stop crawling)
        end
        
        alt URL already visited OR depth > 1
            Crawler->>Crawler: return (skip URL)
        end
        
        Note over Crawler: Add URL to visitedUrls
        
        Crawler->>Website: GET request with User-Agent
        Website-->>Crawler: HTML response or error
        
        alt Request fails
            Note over Crawler: Log warning, continue with next URL
        else Request succeeds
            Crawler->>Crawler: cheerio.load(response.data)
            
            Note over Crawler: Extract images from current page
            Crawler->>Crawler: extractImages($, sourceUrl, images)
            
            loop For each img tag
                alt Should stop OR no src attribute
                    Crawler->>Crawler: continue to next image
                end
                
                Crawler->>Crawler: resolveUrl(src, sourceUrl)
                
                alt Image already found OR filtered out
                    Note over Crawler: Skip: duplicates, tiny images, tracking pixels
                    Crawler->>Crawler: continue to next image
                else Valid new image
                    Note over Crawler: Add to foundImages Set
                    Note over Crawler: Push to images array
                end
            end
            
            alt Depth is 0 (main page)
                Note over Crawler: Extract links for deeper crawling
                Crawler->>Crawler: extractLinks($, baseUrl)
                
                loop For each link (max 10)
                    alt Should stop crawling
                        Crawler->>Crawler: break loop
                    end
                    
                    alt Link is same domain AND not visited
                        Crawler->>Robots: checkRobotsTxt(link)
                        Robots-->>Crawler: allowed/disallowed
                        
                        alt Robots allows crawling
                            Crawler->>Crawler: crawlUrl(link, images, 1)
                            Note over Crawler: Recursive call at depth 1
                        end
                    end
                end
            end
        end
    end
    
    Note over Crawler: Crawling complete
    
    Crawler-->>Server: { images: ImageData[] }
    
    Server->>Server: Log completion stats
    Server-->>Client: JSON response with images
    
    Note over Client: Display images in carousel/grid
```

## Key Flow Points

### 1. Request Validation
- Server validates incoming POST request has URL parameter
- Returns 400 error if URL missing

### 2. Crawler Initialization
- Creates new ImageCrawler instance per request
- Resets state: startTime, foundImages Set, visitedUrls Set

### 3. URL Normalization & Robots Check
- Adds https:// prefix if protocol missing
- Fetches and parses robots.txt for domain
- Stops crawling if robots.txt disallows

### 4. Recursive Crawling (Max Depth: 1)
- **Depth 0**: Main page crawling + link extraction
- **Depth 1**: Internal link crawling (same domain only)

### 5. Termination Conditions
- **Image limit**: 50 images maximum
- **Time limit**: 3 minutes maximum
- **Depth limit**: 2 levels maximum
- **Domain restriction**: Same domain only

### 6. Image Filtering Pipeline
- Skip images without src attribute
- Skip duplicate URLs (Set-based deduplication)
- Skip tiny images (< 50x50 pixels)
- Skip tracking/analytics images (URL pattern matching)

### 7. Error Handling
- Network failures: Log warning, continue crawling
- Invalid URLs: Skip silently
- Missing robots.txt: Assume crawling allowed
- Timeout errors: Handled by axios timeout (10s)

### 8. Response Format
```json
{
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "sourceUrl": "https://example.com/page",
      "alt": "Image description"
    }
  ],
  "error": "Optional error message"
}
```