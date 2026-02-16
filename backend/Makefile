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
	fr_env/bin/black app/

lint:
	fr_env/bin/flake8 app --count --select=E9,F63,F7,F82 --show-source --statistics
	fr_env/bin/flake8 app --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics

# Alembic migration commands
generate:
	@read -p "Enter migration message: " msg; \
	fr_env/bin/alembic revision --autogenerate -m "$$msg"

upgrade:
	fr_env/bin/alembic upgrade head

downgrade:
	fr_env/bin/alembic downgrade -1

history:
	fr_env/bin/alembic history

dev:
	fr_env/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8005