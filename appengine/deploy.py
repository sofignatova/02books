import os.path
import pathlib
import shutil
import subprocess
import tempfile

PROJECT_ROOT = pathlib.Path(os.path.abspath(__file__)).parent.parent
print(PROJECT_ROOT)
APPENGINE_ROOT = PROJECT_ROOT / "appengine"
FE_ROOT = PROJECT_ROOT / "fe"
SERVER_ROOT = PROJECT_ROOT / "server"


def build():
    appengine_dir = pathlib.Path(tempfile.mkdtemp())
    print(appengine_dir)

    shutil.copy2(APPENGINE_ROOT / "app.yaml", appengine_dir)

    subprocess.check_call(["npm", "run", "build"], cwd=FE_ROOT)
    shutil.copytree(
        FE_ROOT / "build",
        appengine_dir / "fe",
    )

    python_files = [
        f
        for f in SERVER_ROOT.iterdir()
        if f.is_file() and f.suffix == ".py" and not f.stem.endswith("test")
    ]
    extra_files = [SERVER_ROOT / "requirements.txt"]
    for python_file in python_files + extra_files:
        shutil.copy2(python_file, appengine_dir)

    (appengine_dir / "app.py").rename(appengine_dir / "main.py")
    shutil.copytree(SERVER_ROOT / "corpora", appengine_dir / "corpora")


build()
