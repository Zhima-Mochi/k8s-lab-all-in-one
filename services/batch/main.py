from fastapi import FastAPI, File, UploadFile, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
import markdown
import uuid
import os
import logging
from celery_worker import convert_markdown_task
from shared_state import set_job, get_job, update_job

app = FastAPI(title="Markdown Batch Service")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create a directory for storing uploaded files if it doesn't exist
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes probes"""
    return {"status": "healthy"}

@app.post("/convert")
async def convert_markdown(file: UploadFile = File(...)):
    """
    Submit a markdown file for conversion to HTML
    """
    if file.filename.split('.')[-1].lower() != 'md':
        raise HTTPException(status_code=400, detail="File must be a markdown file (.md)")
    
    try:
        job_id = str(uuid.uuid4())
        
        # Read file content
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # Submit task to Celery with file content directly
        task = convert_markdown_task.delay(content_str, job_id, file.filename)
        
        # Store job information in Redis
        job_data = {
            "status": "pending",
            "task_id": task.id,
            "filename": file.filename
        }
        set_job(job_id, job_data)
        
        return {
            "job_id": job_id,
            "status": "pending",
            "message": "Markdown conversion job submitted"
        }
    except Exception as e:
        logger.error(f"Error submitting conversion job: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error submitting job: {str(e)}")

@app.get("/status/{job_id}")
async def check_status(job_id: str):
    """
    Check the status of a markdown conversion job
    """
    job = get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job

@app.get("/result/{job_id}")
async def get_result(job_id: str):
    """
    Get the HTML result of a completed conversion job
    """
    job = get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job["status"] != "completed":
        return {"status": job["status"], "message": "Job is not completed yet"}
    
    try:
        return JSONResponse(content={
            "status": "completed",
            "html_content": job["html_content"]
        })
    except Exception as e:
        logger.error(f"Error retrieving result: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving result: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
