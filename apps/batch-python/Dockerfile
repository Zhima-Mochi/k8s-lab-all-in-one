# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

# Define environment variables (optional)
# ENV JOB_ID="default_job"
# ENV ITERATIONS="3"

# Run main.py when the container launches
CMD ["python", "main.py"]
