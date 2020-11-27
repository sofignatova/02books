# 02Books Backend

The 02Books backend is a JSON REST server implemented using
[Python](https://python.org/) and [Flask](https://flask.palletsprojects.com/).

## Starting the backend

From inside of this directory, run:

```shell
python -m venv venv  # Must be Python 3.8 or later
source venv/bin/activate    # Or venv\Scripts\activate.bat on Windows
pip install -r requirements.txt
flask run
```

## Running the tests

Assuming that you already installed a virtualenv as described above,
run:

```shell
pip install -r requirements-test.txt
nox
```
