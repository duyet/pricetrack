firebase functions:config:set pricetrack.sentry_dsn=
firebase functions:config:set pricetrack.cronjob_key=
firebase functions:config:set pricetrack.api_key=
firebase functions:config:set pricetrack.admin_token=
firebase functions:config:set pricetrack.gmail_email=
firebase functions:config:set pricetrack.gmail_password=
firebase functions:config:set pricetrack.hosting_url=
firebase functions:config:set pricetrack.accesstrade_deeplink_base=
firebase functions:config:set pricetrack.accesstrade_token=
firebase functions:config:set pricetrack.admin_email=
firebase functions:config:set pricetrack.cashback_rate=0.5

# in case of deploy /pullData function to worker VM, use this config to make
# /cronjob trigger to this url
# e.g. http://worker.pricetrack.duyet.net/duyet-price-tracker/us-central1
firebase functions:config:set pricetrack.worker_custom_domain=