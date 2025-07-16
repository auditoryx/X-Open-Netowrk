#!/bin/bash

# BigQuery Logging Sink Setup Script
# This script creates a Cloud Logging sink that exports Firebase Function errors to BigQuery

set -e

echo "🔧 Setting up BigQuery logging sink for Firebase Functions errors..."

# Configuration
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-your-project-id}"
DATASET_ID="logs_prod"
TABLE_ID="functions_errors"
SINK_NAME="functions-errors-to-bigquery"
REGION="${GOOGLE_CLOUD_REGION:-us-central1}"

echo "📋 Configuration:"
echo "   Project ID: $PROJECT_ID"
echo "   Dataset ID: $DATASET_ID"
echo "   Table ID: $TABLE_ID"
echo "   Sink Name: $SINK_NAME"
echo "   Region: $REGION"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install Google Cloud SDK."
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ No active gcloud authentication found. Please run 'gcloud auth login'."
    exit 1
fi

# Set project
echo "🏗️  Setting up project $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable logging.googleapis.com
gcloud services enable bigquery.googleapis.com

# Create BigQuery dataset if it doesn't exist
echo "📊 Creating BigQuery dataset $DATASET_ID..."
if ! bq ls -d $PROJECT_ID:$DATASET_ID &> /dev/null; then
    bq mk --dataset \
        --description="Production logs dataset for AuditoryX" \
        --location=$REGION \
        $PROJECT_ID:$DATASET_ID
    echo "✅ Dataset $DATASET_ID created successfully"
else
    echo "ℹ️  Dataset $DATASET_ID already exists"
fi

# Create BigQuery table for function errors
echo "📋 Creating BigQuery table $TABLE_ID..."
bq mk --table \
    --description="Firebase Functions errors and logs" \
    --time_partitioning_field=timestamp \
    --time_partitioning_type=DAY \
    $PROJECT_ID:$DATASET_ID.$TABLE_ID \
    timestamp:TIMESTAMP,severity:STRING,resource:RECORD,jsonPayload:RECORD,textPayload:STRING,labels:RECORD,httpRequest:RECORD,operation:RECORD,trace:STRING,spanId:STRING,traceSampled:BOOLEAN,sourceLocation:RECORD,split:RECORD,protoPayload:RECORD,insertId:STRING,receiveTimestamp:TIMESTAMP,logName:STRING

echo "✅ Table $TABLE_ID created successfully"

# Create log sink
echo "🔗 Creating log sink $SINK_NAME..."

# Define the log filter for Firebase Functions errors
LOG_FILTER='resource.type="cloud_function"
severity>=ERROR
resource.labels.function_name!=""
(
  jsonPayload.message!=""
  OR textPayload!=""
  OR protoPayload.status.code!=0
)'

# Create the sink
gcloud logging sinks create $SINK_NAME \
    bigquery.googleapis.com/projects/$PROJECT_ID/datasets/$DATASET_ID \
    --log-filter="$LOG_FILTER" \
    --description="Export Firebase Functions errors to BigQuery logs_prod dataset"

echo "✅ Log sink $SINK_NAME created successfully"

# Grant permissions to the sink's service account
echo "🔐 Setting up permissions..."
SINK_SERVICE_ACCOUNT=$(gcloud logging sinks describe $SINK_NAME --format="value(writerIdentity)")
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="$SINK_SERVICE_ACCOUNT" \
    --role="roles/bigquery.dataEditor"

echo "✅ Permissions granted to $SINK_SERVICE_ACCOUNT"

# Verify the sink
echo "🔍 Verifying sink configuration..."
gcloud logging sinks describe $SINK_NAME

echo ""
echo "🎉 BigQuery logging sink setup completed successfully!"
echo ""
echo "📊 Your Firebase Functions errors will now be exported to:"
echo "   Project: $PROJECT_ID"
echo "   Dataset: $DATASET_ID"
echo "   Table: $TABLE_ID"
echo ""
echo "🔍 To query the logs, use:"
echo "   bq query --use_legacy_sql=false 'SELECT * FROM \`$PROJECT_ID.$DATASET_ID.$TABLE_ID\` ORDER BY timestamp DESC LIMIT 100'"
echo ""
echo "📈 Monitor your logs at:"
echo "   https://console.cloud.google.com/logs/query?project=$PROJECT_ID"
echo "   https://console.cloud.google.com/bigquery?project=$PROJECT_ID&ws=!1m4!1m3!3m2!1s$PROJECT_ID!2s$DATASET_ID"