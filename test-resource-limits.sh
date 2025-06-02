#!/bin/bash
set -e

# Script to test Kubernetes resource limits
# This script will deploy stress test pods and monitor their behavior

echo "===== Kubernetes Resource Limits Testing ====="
echo "This script will help you observe OOMKilled and CPU throttling"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed or not in PATH"
    exit 1
fi

# Check if the cluster is running
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: Cannot connect to Kubernetes cluster"
    echo "Please ensure your cluster is running and kubectl is configured correctly"
    exit 1
fi

# Function to run a test
run_test() {
    local test_type=$1
    local yaml_file=$2
    local watch_command=$3
    
    echo ""
    echo "===== Running $test_type Test ====="
    echo "Deploying $yaml_file..."
    
    kubectl apply -f "$yaml_file"
    
    echo ""
    echo "Waiting for pod to start..."
    sleep 5
    
    # Get the pod name
    POD_NAME=$(kubectl get pods -l app=$test_type -o jsonpath="{.items[0].metadata.name}" 2>/dev/null)
    
    if [ -z "$POD_NAME" ]; then
        echo "Error: Pod not found. Deployment may have failed."
        return 1
    fi
    
    echo "Pod name: $POD_NAME"
    echo ""
    echo "Monitoring pod status (press Ctrl+C to stop watching):"
    echo "Running: $watch_command"
    echo ""
    
    # Run the watch command
    eval "$watch_command"
    
    echo ""
    echo "Test completed. Cleaning up..."
    kubectl delete -f "$yaml_file"
}

# Main menu
while true; do
    echo ""
    echo "Select a test to run:"
    echo "1. Memory Limit Test (OOMKilled)"
    echo "2. CPU Limit Test (Throttling)"
    echo "3. Exit"
    echo ""
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            # Memory test
            run_test "memory-stress-test" "manifests/dev/memory-stress-test.yaml" "kubectl get pod \$POD_NAME -o wide --watch & sleep 2; kubectl top pod \$POD_NAME --containers; wait"
            ;;
        2)
            # CPU test
            run_test "cpu-stress-test" "manifests/dev/cpu-stress-test.yaml" "kubectl get pod \$POD_NAME -o wide --watch & sleep 2; kubectl top pod \$POD_NAME --containers; wait"
            ;;
        3)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            ;;
    esac
done
