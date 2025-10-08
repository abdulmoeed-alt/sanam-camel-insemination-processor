# Insemination Handler (Alibaba Function Compute)

This project is a serverless Function Compute handler for processing MNS delayed messages related to insemination workflows.

## Deploy
1. Zip this folder and upload to Alibaba Function Compute.
2. Set environment variables:
   - MONGO_URI
   - MONGO_DBNAME
   - MNS_ENDPOINT
   - MNS_QUEUE_NAME
   - ALIYUN_ACCESS_KEY
   - ALIYUN_SECRET_KEY
   - FCM_CREDENTIALS_JSON (JSON string of service account)
3. Create MNS queue and set as trigger for the Function.
4. Configure DLQ for the queue.

## Notes
- The code expects documents in `inseminations` collection. Insert simulated fields for testing (simulatedInseminationResult, pregnancyEnd, lactationEnd).
- The FCM credentials should be provided as a JSON string in env var `FCM_CREDENTIALS_JSON`.
