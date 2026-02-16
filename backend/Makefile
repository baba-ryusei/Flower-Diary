DB_COMPOSE = infra/docker-compose.yml

db-up:
	docker-compose -f $(DB_COMPOSE) up -d 

db-down:
	docker-compose -f $(DB_COMPOSE) down

db-logs:
	docker-compose -f $(DB_COMPOSE) logs 

db-reset:
	docker-compose -f $(DB_COMPOSE) down -v

format:
	black app/

lint:
	flake8 app --count --select=E9,F63,F7,F82 --show-source --statistics
	flake8 app --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics

dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8005