import azure.functions as func
import logging
import json
import os
from azure.data.tables import TableServiceClient, UpdateMode

app = func.FunctionApp()

# Get connection string from environment variable
CONNECTION_STRING = os.environ.get('AzureWebJobsStorage')
TABLE_NAME = 'VisitorCount'

def get_table_client():
    """Initialize and return a table client"""
    table_service = TableServiceClient.from_connection_string(CONNECTION_STRING)
    table_client = table_service.get_table_client(TABLE_NAME)
    return table_client

def get_or_create_counter():
    """Get current count or create if doesn't exist"""
    table_client = get_table_client()
    
    try:
        # Try to get existing entity
        entity = table_client.get_entity(partition_key='stats', row_key='visitors')
        count = entity.get('count', 0)
    except Exception as e:
        # Entity doesn't exist, create it
        logging.info(f"Counter not found, creating new one: {e}")
        entity = {
            'PartitionKey': 'stats',
            'RowKey': 'visitors',
            'count': 0
        }
        table_client.create_entity(entity)
        count = 0
    
    return count, table_client

def increment_counter(table_client, current_count):
    """Increment the visitor count"""
    entity = {
        'PartitionKey': 'stats',
        'RowKey': 'visitors',
        'count': current_count + 1
    }
    table_client.upsert_entity(entity, mode=UpdateMode.REPLACE)
    return current_count + 1

@app.route(route="GetVisitorCount", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET", "POST"])
def GetVisitorCount(req: func.HttpRequest) -> func.HttpResponse:
    """
    HTTP trigger function that increments and returns visitor count.
    Supports CORS for frontend integration.
    """
    logging.info('Visitor counter function triggered.')
    
    try:
        # Get current count
        current_count, table_client = get_or_create_counter()
        
        # Increment count
        new_count = increment_counter(table_client, current_count)
        
        logging.info(f'Visitor count incremented to: {new_count}')
        
        # Return JSON response with CORS headers
        response = func.HttpResponse(
            body=json.dumps({'count': new_count}),
            status_code=200,
            mimetype='application/json'
        )
        
        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        
        return response
        
    except Exception as e:
        logging.error(f'Error in visitor counter: {str(e)}')
        
        error_response = func.HttpResponse(
            body=json.dumps({'error': 'Internal server error', 'details': str(e)}),
            status_code=500,
            mimetype='application/json'
        )
        
        # Add CORS headers even for errors
        error_response.headers['Access-Control-Allow-Origin'] = '*'
        
        return error_response

@app.route(route="GetVisitorCount", auth_level=func.AuthLevel.ANONYMOUS, methods=["OPTIONS"])
def GetVisitorCountOptions(req: func.HttpRequest) -> func.HttpResponse:
    """Handle CORS preflight requests"""
    response = func.HttpResponse(status_code=200)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response