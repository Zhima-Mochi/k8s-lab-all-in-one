import time
import os
import random

def main():
    job_id = os.getenv("JOB_ID", f"job_{random.randint(1000, 9999)}")
    print(f"Starting batch job: {job_id}")
    
    # Simulate some work
    iterations = int(os.getenv("ITERATIONS", "5"))
    for i in range(iterations):
        print(f"Job {job_id}: Processing item {i+1}/{iterations}...")
        time.sleep(random.uniform(0.5, 2.0)) # Simulate variable processing time
        
    print(f"Batch job {job_id} completed successfully.")

if __name__ == "__main__":
    main()
