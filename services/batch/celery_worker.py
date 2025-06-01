import os
import time
import markdown
from celery import Celery
import logging
from shared_state import update_job, get_job

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Celery
redis_host = os.environ.get('REDIS_HOST', 'redis')
redis_port = os.environ.get('REDIS_PORT', '6379')
redis_url = f"redis://{redis_host}:{redis_port}/0"

app = Celery('batch_tasks', broker=redis_url, backend=redis_url)

@app.task(name="convert_markdown_task")
def convert_markdown_task(markdown_content, job_id, filename="document.md"):
    """
    Convert markdown content directly to HTML
    """
    try:
        logger.info(f"Processing job {job_id}, filename: {filename}")
        
        # Simulate processing time for demonstration
        time.sleep(2)
        
        # Convert markdown to HTML
        html_content = markdown.markdown(
            markdown_content,
            extensions=['extra', 'codehilite']
        )
        
        # Store HTML content directly in the job state using Redis
        update_job(job_id, status="completed", html_content=html_content)
        
        logger.info(f"Job {job_id} completed successfully")
        return {"status": "completed", "job_id": job_id}
        
    except Exception as e:
        logger.error(f"Error processing job {job_id}: {str(e)}")
        # Update job status with error using Redis
        update_job(job_id, status="failed", error=str(e))
        return {"status": "failed", "job_id": job_id, "error": str(e)}
