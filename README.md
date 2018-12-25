# Price Track Project

# Installation

1. **Set up Node.js and the Firebase CLI**
	You'll need a Node.js environment. This project is written with Nodejs 8.x.
	After that, install the Firebase CLI via npm:

	```
	npm install -g firebase-tools
	```

	To initialize project: Run `firebase login` to log in via the browser and authenticate the firebase tool.

	Setup packages: `cd functions/ && npm install`

2. Go to https://console.firebase.google.com and create new project.

3. **Deploy serverless functions and hosting to Firebase**
	```
	firebase deploy
	```

	You can also start this project locally via: `firebase serve`

	All functions will be list at Firebase Dashboard:

	![Firebase Dashboard](.screenshot/setup-dashboard-functions.png)

4. **Test your API**
	
	Add new URL: `https://<your-project>.cloudfunctions.net/addUrl?url=<your-url>`

	![Test API](.screenshot/setup-test-1.png)

	List: `https://<your-project>.cloudfunctions.net/listUrls`

	![Test API](.screenshot/setup-test-2.png)

	Pull data: `https://<your-project>.cloudfunctions.net/pullData?url=<your-url>`

	![Test API](.screenshot/setup-test-3.png)

	Query in raw data: `https://<your-project>.cloudfunctions.net/query?url=<your-url>&fields=datetime,price&limit=100`

	![Test API](.screenshot/setup-test-4.png)


5. **Setup Redash on Heroku**: https://github.com/willnet/redash-on-heroku
	![Redash on Heroku](.screenshot/setup-redash.png)

	At API as Data Source:
	![Redash on Heroku](.screenshot/setup-redash-data-source.png)

	Enter your api URL:
	![Redash on Heroku](.screenshot/setup-data-source-add.png)

	Query in Data Source:
	![Redash on Heroku](.screenshot/setup-redash-query.png)

	Visualize from Redash Query:
	![Redash on Heroku](.screenshot/setup-redash-vis.png)

	Redash Dashboard:
	![Redash on Heroku](.screenshot/setup-redash-vis-add-dashboard.png)

	Final Dashboard:
	![Redash on Heroku](.screenshot/setup-redash-dashboard.png)

	Alert when price change:
	![Redash on Heroku](.screenshot/setup-redash-alert.png)


# Technology

- UI Website for result (Vue.js)
- Cronjob trigger worker (https://www.google.com/search?num=20&q=cron+job+trigger, https://cron-job.org)
- Deployment:
	+ API: Firebase Functions
	+ Database: Firebase Firestore
	+ Web: Firebase Hosting
- Visualization tools: Redash

# Modules

- functions
	+ add, remove, list url
	+ pullData
	+ cronjobs
- web