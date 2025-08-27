from celery import Celery
import os


def make_celery() -> Celery:
	redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
	backend_url = os.getenv("CELERY_RESULT_BACKEND", redis_url)

	celery = Celery(
		"neurospace",
		broker=redis_url,
		backend=backend_url,
		include=["app.tasks.processing_tasks"],
	)

	celery.conf.update(
		task_serializer="json",
		result_serializer="json",
		accept_content=["json"],
		task_acks_late=True,
		worker_prefetch_multiplier=1,
		broker_transport_options={"visibility_timeout": 3600},
	)

	return celery


celery_app = make_celery()

