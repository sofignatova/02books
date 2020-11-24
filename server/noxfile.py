"""Nox config for running lint and unit tests."""

import nox


@nox.session
def lint(session):
    session.install("black")
    session.run(
        "black",
        "--check",
        ".",
    )


@nox.session
def unit(session):
    session.install("-r", "requirements-test.txt")
    session.run("py.test", "--quiet", *session.posargs)


@nox.session
def type_check(session):
    session.install("-r", "requirements-test.txt")
    session.run("mypy", ".")
