# How to start the backend

## Poetry install dependecies and virtual environment

Install poetry globally on your device using the next command:

```
pip install poetry
```
To preference please do the next command to modify poetry with the porpuse of it create the virtual environment inside the project:
```
poetry config virtualenvs.in-project true
```
If you don't, the virtual environment will be created inside the source folder of poetry. (Read the note if this is your case)

Being on the backend folder, then execute the next command to install the dependecies of the project:

```
poetry install --no-root
```

> [!NOTE]
> Inspect with `poetry env list` if you have an active virtual environment. Otherwise, activate it with `poetry shell`, but if you prefer to select it please use `poetry env use [name_of_env]`. At last, if you haven't a poetry virtual environment, create one with `poetry env use [pythonVersion]`.

## Initialization of the backend

Don't forget to create an `.env` file on this backend folder, follow the [`.env.example`](/backend/.env.example) file to apply the correct format.

Start all databases migrations files with:
```
poetry run python manage.py migrate
```
And finally, to start the backend:
```
poetry run python manage.py runserver
```
