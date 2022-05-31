# table
## dynamodb, datastore

### Installing
```s
npm i @thefinerthings/table
```

### Usage
```js
const Table = require('@thefinerthings/table')

const table = Table({
  region: '<aws region>',
  accessKeyId: '<aws access key id>',
  secretAccessKey: '<aws secret access key>',
})

/* gcp - datastore

const table = Table({
  gcp: { ... },
})

*/

const id = 'testId';
const name = table.set('aws-dynamodb-table-name').TableName;

// Each API returns the data, or an object containing { data, last }
table.get(name, id).then(data => {
  console.log(data);
}).catch(err => console.log(err));
```
* The schema for the following methods assumes that your data is a bunch of strings. Queries or scans can be customized through the `scan` or  `query` functions to account for any other data types that have been defined.

### API
```js
Table({
  region: '<aws region>',
  accessKeyId: '<aws access key id>',
  secretAccessKey: '<aws secret access key>',
})
```
* `region` - string (aws credential)
* `accessKeyId` - string (aws credential)
* `secretAccessKey` - string (aws credential)

```js
table.set(table_name, key, limit, database)
```
This function sets the desired table and basic attributes that are used throughout the `Table` class.
* `table_name` - string (name of the DynamoDB table to be used)
* `key` - string or object (the primary key of the DynamoDB table)
  * defaults to `id`
* `limit` - number (the number of items that will be returned on each fetch)
  * defaults to `AWS` which is currently `1MB`
* `database` - string ('gcp')

```js
table.table(name, database)
```
This function creates a table in DyanmoDB if it has not been created using the AWS console. It will throw an error if the table already exists.
* `name` - string (name of the DynamoDB table to be used)
* `database` - string ('gcp')

```js
table.get(name, id, database)
```
* `name` - string (table name that you wish to reference)
* `id` - string or object (id of the item you wish to fetch)
  * object may contain the partition key and sort key for object lookup
* `database` - string ('gcp')

```js
table.count(name, database)
```
* `name` - string (table name that you wish to reference)
* `database` - string ('gcp')

```js
table.all(name, last, limit, database)
```
* `name` - string (table name that you wish to reference)
* `last` - string or object (key of the last evaluated item)
  * this is returned when you have more items in the table than is allowed by the limit
* `limit` - number
* `database` - string ('gcp')

```js
table.query_all(name, last, limit, database)
```
This is good to use for tables with a partition and sort key.
* `name` - string (table name that you wish to reference)
* `last` - string or object (key of the last evaluated item)
  * this is returned when you have more items in the table than is allowed by the limit
* `limit` - number
* `database` - string ('gcp')

```js
table.index(name, index, params, last, limit, database)
```
* `name` - string (table name that you wish to reference)
* `index` - string (name of the index that is going to scanned)
* `params` - object (key-value pairs to match using an `and` operation during scan)
* `last` - string or object (key of the last evaluated item)
  * this is returned when you have more items in the table than is allowed by the limit
* `limit` - number
* `database` - string ('gcp')

```js
table.index_search(name, index, key, array, last, limit, database)
```
* `name` - string (table name that you wish to reference)
* `index` - string (name of the index that is going to scanned)
* `key` - string (key to compare against while scanning the index)
* `array` - array (values match using an `or` operation during scan)
* `last` - string or object (key of the last evaluated item)
  * this is returned when you have more items in the table than is allowed by the limit
* `limit` - number
* `database` - string ('gcp')

```js
table.find(name, params, last, limit, database)
```
* `name` - string (table name that you wish to reference)
* `params` - object (key-value pairs to match using an `and` operation during scan)
* `last` - string or object (key of the last evaluated item)
  * this is returned when you have more items in the table than is allowed by the limit
* `limit` - number
* `database` - string ('gcp')

```js
table.grab(name, params, last, limit, database)
```
* `name` - string (table name that you wish to reference)
* `params` - object (key-value pairs to match using an `or` operation during scan)
* `last` - string or object (key of the last evaluated item)
  * this is returned when you have more items in the table than is allowed by the limit
* `limit` - number
* `database` - string ('gcp')

```js
table.search(name, key, array, last, limit, database)
```
* `name` - string (table name that you wish to reference)
* `key` - string (key to compare against while scanning the index)
* `array` - array (values match using an `or` operation during scan)
* `last` - string or object (key of the last evaluated item)
  * this is returned when you have more items in the table than is allowed by the limit
* `limit` - number
* `database` - string ('gcp')

```js
table.scan(name, params, last, database)
```
* `name` - string (table name that you wish to reference)
* `params` - object 
  * generally, contains values for [FilterExpression, ExpressionAttributeNames, ExpressionAttributeValues](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html)
* `last` - string or object (key of the last evaluated item)
  * this is returned when you have more items in the table than is allowed by the limit
* `database` - string ('gcp')

```js
table.query(name, params, last, database)
```
This is good to use for tables with a partition and sort key.
* `name` - string (table name that you wish to reference)
* `params` - object
  * generally, contains values for [FilterExpression, ExpressionAttributeNames, ExpressionAttributeValues](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html)
* `last` - string or object (key of the last evaluated item)
  * this is returned when you have more items in the table than is allowed by the limit
* `database` - string ('gcp')

Example
```js
table.query(
  name, {
    IndexName: 'partition-sort-index',
    KeyConditionExpression: '#t = :em',
    ExpressionAttributeNames: {
      "#t": 'partition',
    },
    ExpressionAttributeValues: {
      ":em": 'value',
    },
    ScanIndexForward: false,
  }, params
)
```

```js
table.create(name, params, database)
```
* `name` - string (table name that you wish to reference)
* `params` - object (key-value pairs be added to the table)
* `database` - string ('gcp')

```js
table.update(name, id, params, database)
```
* `name` - string (table name that you wish to reference)
* `id` - string (id of the item you wish to update)
* `params` - object (key-value pairs update on the item)
* `database` - string ('gcp')

```js
table.remove(name, params, database)
```
* `name` - string (table name that you wish to reference)
* `params` - object (map of keys that you wish to remove from an item)
  * you must pass in the id of the item you wish to remove
* `database` - string ('gcp')

```js
table.delete(name, id, database)
```
* `name` - string (table name that you wish to reference)
* `id` - string (id of the item you wish to delete from the table)
* `database` - string ('gcp')

#### Example
```js
const Table = require('@thefinerthings/table')

const table = Table({
  region: '<aws region>',
  accessKeyId: '<aws access key id>',
  secretAccessKey: '<aws secret access key>',
})

const id = 'testId';
const name = table.set('aws-dynamodb-table-name').TableName;

let end = null; 
let prev = end; 
let start = true;

while (start || (end && end !== prev)) {
  if (start) start = false;
  table.all(name, end).then(({ data, last }) => {
    // last is just the id of the last value not an object
    // you may need to do: get(last).then(data => { ... })
    if (last) {
      prev = end;
      end = last;
    } console.log(data);
  }).catch(err => console.log(err));
}
```
