# Rock MCP Server

A Model Context Protocol (MCP) server for interacting with RockRMS APIs. This server provides tools for accessing RockRMS API endpoints through the MCP protocol.


## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd rock-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables

Configure your RockRMS API connection using environment variables. The server supports `.env` files for easy configuration.

1. **Copy the example configuration:**
   ```bash
   cp config.env.example .env
   ```

2. **Edit the `.env` file with your actual values:**
   ```env
   # Rock RMS API Configuration
   ROCK_API_BASE_URL=https://your-rock-instance.com
   
   # Authentication (username/password is recommended)
   ROCK_USERNAME=your_username
   ROCK_PASSWORD=your_password
   
   # Server Configuration (optional)
   PORT=3003
   ```

3. **Alternative: Set environment variables directly:**
   ```bash
   export ROCK_API_BASE_URL="https://rock.yourdomain.com"
   export ROCK_USERNAME="your-username"
   export ROCK_PASSWORD="your-password"
   export PORT="3003"
   ```

### Available Environment Variables

- `ROCK_API_BASE_URL` - Your RockRMS instance URL (required)
- `ROCK_USERNAME` - Your RockRMS username (recommended)
- `ROCK_PASSWORD` - Your RockRMS password (recommended)
- `ROCK_API_KEY` - Your RockRMS API key (alternative, may have permission limitations)
- `PORT` - Server port (default: 3003 for Streamable HTTP, 3002 for SSE, 3001 for stdio)

> **Note:** Username/password authentication is the preferred method. API keys may have permission limitations that prevent access to certain endpoints.

## Usage

The Rock MCP Server supports three different transport modes:

### Streamable HTTP (Recommended)
Modern transport protocol with better performance and stability:
```bash
npm run dev              # Default mode
npm run dev:streamable   # Explicit streamable HTTP
```
**Endpoint:** `http://localhost:3003/mcp`

### SSE (Server-Sent Events)
HTTP + SSE transport for remote connections:
```bash
npm run dev:sse
```
**Endpoint:** `http://localhost:3002/sse`

### Stdio (Standard Input/Output)
Local transport mode for direct MCP communication:
```bash
npm run dev:stdio
npm start                # Production mode
```
**Communication:** Standard input/output streams

### Cursor IDE Configuration

Add the following to your `.cursor/mcp.json` file:

#### For Streamable HTTP (Recommended):
```json
{
  "mcpServers": {
    "rock-mcp-server": {
      "url": "http://localhost:3003/mcp",
      "env": {
        "ROCK_API_BASE_URL": "https://your-rock-instance.com",
        "ROCK_USERNAME": "your_username",
        "ROCK_PASSWORD": "your_password"
      }
    }
  }
}
```

#### For SSE:
```json
{
  "mcpServers": {
    "rock-mcp-server": {
      "url": "http://localhost:3002/sse",
      "env": {
        "ROCK_API_BASE_URL": "https://your-rock-instance.com",
        "ROCK_USERNAME": "your_username",
        "ROCK_PASSWORD": "your_password"
      }
    }
  }
}
```

#### For Stdio:
```json
{
  "mcpServers": {
    "rock-mcp-server": {
      "command": "node",
      "args": ["dist/server.js"],
      "cwd": "/path/to/rock-mcp",
      "env": {
        "ROCK_API_BASE_URL": "https://your-rock-instance.com",
        "ROCK_USERNAME": "your_username",
        "ROCK_PASSWORD": "your_password"
      }
    }
  }
}
```

### Available Tools

#### Get Pages
Retrieve pages from RockRMS:
```json
{
  "name": "get_pages",
  "arguments": {
    "params": {
      "$filter": "IsActive eq true",
      "$select": "Id,Name,Description,Url",
      "$top": 20
    }
  }
}
```

### Example API Calls

#### Get All Active Pages
```json
{
  "name": "get_pages",
  "arguments": {
    "params": {
      "$filter": "IsActive eq true",
      "$select": "Id,Name,Description,Url"
    }
  }
}
```

#### Get Specific Page by Name
```json
{
  "name": "get_pages",
  "arguments": {
    "params": {
      "$filter": "Name eq 'Home'",
      "$select": "Id,Name,Description,Url,Content"
    }
  }
}
```

## OData Query Options

RockRMS API supports OData query parameters:

- `$filter` - Filter results (e.g., "IsActive eq true")
- `$select` - Choose specific fields (e.g., "Id,FirstName,LastName")
- `$expand` - Include related data (e.g., "Person,Group")
- `$orderby` - Sort results (e.g., "LastName asc")
- `$top` - Limit number of results (e.g., 50)
- `$skip` - Skip number of results for pagination (e.g., 100)

## Error Handling

The server includes built-in error handling and will return error messages for:

- API endpoint not found (404)
- Authentication failures (401)
- API rate limit exceeded (429)
- Invalid request data (400)
- Server errors (500)
- Network timeouts or connection issues

## Development

### Building
```bash
npm run build
```

### Running in Development
```bash
npm run dev
```
