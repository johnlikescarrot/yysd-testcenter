#!/bin/sh
# Run in ielts-vi/. The normal build first verifies that checked-in catalogues
# are current. Exercising --catalogue afterwards must leave them unchanged.
set -eu
mkdir -p coverage
python3 -m coverage erase
python3 -m coverage run tools/build.py
python3 -m coverage run --append tools/build.py --catalogue
node tools/prerender.mjs
python3 -m coverage run --append tools/verify.py
PYTHONPATH="tools${PYTHONPATH:+:$PYTHONPATH}" python3 -m coverage run --append -m unittest discover -s tests -p 'test_*.py'
python3 -m coverage report
