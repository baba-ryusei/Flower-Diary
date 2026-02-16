DB_COMPOSE = infra/docker-compose.yml

db-up:
	docker-compose -f $(DB_COMPOSE) up -d 

db-down:
	docker-compose -f $(DB_COMPOSE) down

db-logs:
	docker-compose -f $(DB_COMPOSE) logs 

db-reset:
	docker-compose -f $(DB_COMPOSE) down -v

dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8005