# Deploying on App Engine

02Books can be packaged such that the complete system (frontend and backend)
can run on [App Engine](https://cloud.google.com/appengine) using only
[free quota](https://cloud.google.com/free/docs/gcp-free-tier#free-tier-usage-limits).

To package 02Books for deployment run, from inside of this directory:
`python deploy.py # Python 3.8 or later`

The script will output the correct [gcloud](https://cloud.google.com/sdk/gcloud)
command to run.
