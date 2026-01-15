"""
Gunicorn configuration file for production deployment
Optimized for high traffic news website (1000-2000 concurrent users)
"""

import multiprocessing
import os

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048  # Maximum number of pending connections

# Worker processes
# Formula: (2 x $num_cores) + 1
# For 4 cores: (2 x 4) + 1 = 9 workers
workers = int(os.getenv("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1))

# Worker class
# 'sync' for CPU-bound tasks, 'gevent' or 'eventlet' for I/O-bound tasks
# News sites are typically I/O-bound (database, cache, external APIs)
worker_class = "gevent"  # Better for high concurrency

# Worker connections (only for async workers like gevent/eventlet)
# This is the number of simultaneous clients each worker can handle
worker_connections = 1000

# Worker timeout
# Increase if you have slow database queries or external API calls
timeout = 30  # seconds
graceful_timeout = 30  # seconds
keepalive = 5  # seconds

# Worker restart settings to prevent memory leaks
max_requests = 1000  # Restart worker after this many requests
max_requests_jitter = 50  # Add random jitter to prevent all workers restarting at once

# Logging
accesslog = "-"  # Log to stdout
errorlog = "-"  # Log to stderr
loglevel = os.getenv("GUNICORN_LOG_LEVEL", "info")  # debug, info, warning, error, critical
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "news_backend_gunicorn"

# Server mechanics
daemon = False  # Don't daemonize (Docker/systemd handles this)
pidfile = None
user = None
group = None
tmp_upload_dir = None

# SSL (if needed)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"

# Performance tuning
preload_app = True  # Load application code before forking workers
# This saves RAM and speeds up worker boot time, but makes code reloading harder

# Worker lifecycle hooks
def on_starting(server):
    """Called just before the master process is initialized."""
    print("Starting Gunicorn server...")

def on_reload(server):
    """Called to recycle workers during a reload via SIGHUP."""
    print("Reloading Gunicorn workers...")

def when_ready(server):
    """Called just after the server is started."""
    print(f"Gunicorn server ready. Workers: {workers}, Worker class: {worker_class}")

def pre_fork(server, worker):
    """Called just before a worker is forked."""
    pass

def post_fork(server, worker):
    """Called just after a worker has been forked."""
    print(f"Worker spawned (pid: {worker.pid})")

def pre_exec(server):
    """Called just before a new master process is forked."""
    print("Forking new master process...")

def worker_int(worker):
    """Called when a worker receives the INT or QUIT signal."""
    print(f"Worker {worker.pid} received INT/QUIT signal")

def worker_abort(worker):
    """Called when a worker receives the SIGABRT signal."""
    print(f"Worker {worker.pid} aborted")

# Environment variables
raw_env = [
    # Add environment variables that should be available to the application
    # Example: "DJANGO_SETTINGS_MODULE=config.settings",
]
