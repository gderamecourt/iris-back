# iris-back

> Backend Utils for Iris

## Build Setup

```bash
# install dependencies
npm install

# build for production with minification
npm run build

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

## Import in your project

```bash
# install dependency
npm i @ugieiris/iris-back --save
```

## Actuator

If you want add actuator for your Express Api :

```js
import { actuator } from '@ugieiris/iris-back'

const app = express()
actuator(logger).route(app)
```

## Express Utils

Severals middleware for Express are availables :

- parseJSON: transform body request to a JSON object
- logRequests: log debug request
- errorHandler: log the error and return the good status
- enableCors: enable cors with cors plugin
- returnApplicationJson: add to the header the content-type application/json

```js
import { expressUtils } from '@ugieiris/iris-back'

const utils = expressUtils(logger)
const app = express()
app.use(utils.parseJSON)
```

## Logger

You can create a logger that log in a file and in the console like that :

```js
import { Logger } from '@ugieiris/iris-back'

const logger = Logger.create('debug', 'd:\\temp\\myAppLog.log')
logger.info('my first log')
```

The library `winston` is used to create the logger.

## TypeUtils

You can use that to change variable's type

```js
import { TypeUtils } from '@ugieiris/iris-back'

let int = '8'
console.log(typeof int) //string
await TypeUtils.defineType(TypeUtils.TYPE.INT, int)
console.log(typeof int) //number
```

## Advanced search 

## on mongodb

You can use searchUtils to use a advanced search (min, max , wildcard, list). If you want search with wildcard:

```js
import { SearchUtils } from '@ugieiris/iris-back'

//Your search's object
let object = {
    id: 1
}

SearchUtils.searchStringObject(object, 'libelle', '*ui*')

console.log(object)
/*
object {
    id: 1,
    libelle: {
        $regex: `ui`i
    }
}
*/
```
## on PostgreSQL
To use an advanced search, you must have Sequelize

```js
import SearchUtilsPostgre from '@ugieiris/searchUtilsPostgre'
  async function findAll(query) {
    let where = {}
    const searchUtilsPostgre = SearchUtilsPostgre(where, Sequelize.Op)
    if(query.minCapacity){
      SearchUtilsPostgre.searchMin('capacity', Number(query.minCapacity))
    }
    if(query.maxCapacity){
      SearchUtilsPostgre.searchMax('capacity', Number(query.maxCapacity))
    }
    if(query.title){
      SearchUtilsPostgre.searchString('title', query.title)
    }
    if(query.mail){
      SearchUtilsPostgre.searchList('mail', query.mail)
    }
    return await PaginationUtilsPostgreDAO.findWithPagination(Resource,query.size,query.page,where, query.sort)
  }
```

## Google Auth

To call the api google, you can use googleAuth to get a google authentification token

```js
import { googleAuth } from '@ugieiris/iris-back'

const myGoogleAuth = googleAuth(
  {
    secretPath: 'd:/temp/mySecret.json',
    tokenPath: 'd:/temp/myToken.json'
  },
  logger,
  exceptions
)
const authClient = googleAuth.getGoogleAuthClient()
```

## Pagination

To use pagination you need to change your function that exposes your route (EBS) and your function that makes the request to the database (DAO).

### Pagination EBS

The EBS pagination will allow you to check the size and page requested by the customer, but also to return an appropriate header.

```js
import { PaginationUtilsEBS } from '@ugieiris/iris-back'

commandesRouter.get('/', async (req, res) => {
  try {
    //StartOnPagination check if size and page are a number and check too Accept-Range
    await PaginationUtilsEBS.startOnPagination(req.query, 50)
    const response = await commandesLBS.findCommandes(req.query)
    //generatesResponse generate a header and a status of response
    await PaginationUtilsEBS.generatesResponse(
      'commande',
      50,
      response.count,
      response.response.length,
      req.headers.host + req.originalUrl,
      req.query,
      res
    )
    res.send(response.response)
  } catch (error) {
    res.send(error)
  }
})
```

### Pagination DAO

```js
import { PaginationUtilsDAO } from '@ugieiris/iris-back'

export const findCommandes = async (query) => {
	try {
		let commandeFind = {}
        const commandesDB = await connect()
        //searchInDB create query and response paged
		return await PaginationUtilsDAO.searchInDb('commandes' , commandesDB ,commandeFind , query)

	} catch (error) {
		throw error
	}
```
