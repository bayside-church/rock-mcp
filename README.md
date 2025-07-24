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

Configure your RockRMS API connection by setting environment variables:

```bash
export ROCK_API_BASE_URL="https://rock.yourdomain.com"
export ROCK_API_KEY="your-api-key"
```

Alternatively, create a `.env` file:
```env
ROCK_API_BASE_URL=https://rock.yourdomain.com
ROCK_API_KEY=your-api-key
```

## Usage

Start the server:
```bash
npm start
```

### Available Tools

#### 1. Execute SQL
Execute SQL queries against the RockRMS database:
```json
{
  "name": "execute_sql",
  "arguments": {
    "query": "SELECT TOP 10 * FROM Person WHERE IsActive = 1"
  }
}
```

#### 2. Get Pages
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
