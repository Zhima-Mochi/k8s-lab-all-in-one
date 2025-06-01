# shared_state.py - Module to store shared state between components using Redis
import os
import json
import redis

# Get Redis connection details from environment variables with defaults
REDIS_HOST = os.environ.get('REDIS_HOST', 'redis')
REDIS_PORT = int(os.environ.get('REDIS_PORT', 6379))

# Create Redis client
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)

# Prefix for job keys in Redis
JOB_KEY_PREFIX = 'job:'

# Helper functions for job state management
def set_job(job_id, job_data):
    """Store job data in Redis"""
    redis_client.set(f'{JOB_KEY_PREFIX}{job_id}', json.dumps(job_data))
    
    # Set expiration time to 1 hour (3600 seconds)
    redis_client.expire(f'{JOB_KEY_PREFIX}{job_id}', 3600)

def get_job(job_id):
    """Get job data from Redis"""
    job_data = redis_client.get(f'{JOB_KEY_PREFIX}{job_id}')
    if job_data:
        return json.loads(job_data)
    return None

def update_job(job_id, **kwargs):
    """Update specific fields in job data"""
    job_data = get_job(job_id)
    if job_data:
        job_data.update(kwargs)
        set_job(job_id, job_data)
        return True
    return False
