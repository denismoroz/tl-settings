# tl-settings
Application settings that are saved in DB.

Main idea is to provide a tools to help store application settings.
For easy customization and extending parts that are related to external components are extracted in separate modules.

# Flow

* **Declare settings**. 
Core component provides a base class and set of decorators to define a settings of the application.
Please take a look at [example](./example/settings.js).

* **Register your settings**.
Settings are stored in singleton object. Modules in nodejs considered already to be a singletons, 
but they are tied to path to a module and it matters a case of the module path. To avoid issues like this
Singleton based on ES6 symbols is used in this application. Idea is taken [from](https://derickbailey.com/2016/03/09/creating-a-true-singleton-in-node-js-with-es6-symbols/).

* **Use settings**.
Core Component export function [getSettingsInstance](./core/settings_base.js) that can be used to 
access settings singleton. But it is more handy to export getSettingsInstanse from defined application settings module and use it.
That will make your code to require only your settings implementation class.
[Usage Example](./example/app.js). Settings intended to be stored in DB so ***registerSettings*** method intended to be async.
As soon as settings are loaded core component subscribed on pubsub channel to keep memory copy of settings up to date.

* **Modify settings**.
Settings are stored in a DB and can be updated. Application provides a basic interface to manipulate them.
 

# Components

* [Core](./core) - Heart of application. It provides set of decorators to be used and store all logic.
* [Db](./db) - Database backend. In stock version PostgreSQL is used as a DB backend, but it is possible 
to use any that looks reasonable for your application.  If you would like to add a new backend, 
implement the same interface as for [Storage](./db/db.js) and pass storage class name to ***registerSettings*** method.
Core component will build a DB class and pass instance of settings class to init() method. 
That is needed for proper DB backend configuration.
* [PubSub](./pubsub) - As soon as any setting of the application is updated, other copies of application 
can be notified about this event for proper settings reloading from DB. In stock version 
that is implemented using Redis, but nothing prevents to use any other PubSub engine for that.
For that just implement the same interface as in [PubSub](./pubsub/pubsub.js) and pass class name to ***registerSettings***
* [Ui](./ui) - That is an example of a basic UI for settings manipulation that are stored in DB written on express.
Example of usage can be found in [example](./example/app.js)
* [Example](./example) - That is the most interesting part. It provides an example how to create 
an application settings use them and how to utilize an UI component for settings manipulation.
On a moment of writing this readme, decorators are still on stage 2 proposal, so to use decorators, 
babel plugin is used to compile code.  


  

 