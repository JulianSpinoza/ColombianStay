# How to start the backend

## Poetry install dependecies and virtual environment

Install poetry globally on your device using the next command:

```
pip install poetry
```
Being on the frontend folder, install the dependecies of the project with:
```
poetry install
```
> [!NOTE]
> Inspect with `poetry env info` the path of the virtual environment and check the python interpreter on your code editor is the same of the virtual.


Start all migrations with:
```
poetry run python manage.py migrate
```
And finally, to start the backend:
```
poetry run python manage.py runserver
```
