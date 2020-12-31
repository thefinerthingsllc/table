# table
## dynamodb

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

const id = 'testId';
const name = table.set('aws-dynamodb-table-name').TableName;

table.get(name, id).then((data) => {
  console.log(data);
}).catch(err => console.log(err));
```

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
table.set(table_name, key, limit)
```
This function sets the desired table and basic attributes that are used throughout the `Table` class.
* `table_name` - string (name of the DynamoDB table to be used)
* `key` - string (the primary key of the DynamoDB table)
  * defaults to `id`
* `limit` - number (the number of items that will be returned on each fetch)
  * defaults to `AWS` which is currently `1MB`

```js
table.table(name)
```
This function creates a table in DyanmoDB if it has not been created using the AWS console. It will throw an error if the table already exists.
* `name` - string (name of the DynamoDB table to be used)

```js
table.get(name, id)
```
* `name` - string (table name that you wish to reference)
* `id` - string (id of the item you wish to fetch)

```js
table.count(name)
```
* `name` - string (table name that you wish to reference)

```js
table.all(name, last)
```
* `name` - string (table name that you wish to reference)
* `last` - string (key of the last evaluated item)
  * this is returned when you have more items in the table than is allowed by the limit

```js
table.index(name, index, params, last)
```
* `name` - string (table name that you wish to reference)
* `index` - string (name of the index that is going to scanned)
* `params` - object (key-value pairs to match using an `and` operation during scan)
* `last` - string or object (key of the last evaluated item)
  * this is returned when you have more items in the table than is allowed by the limit

```js
table.index_search(name, index, key, array, last)
```
* `name` - string (table name that you wish to reference)
* `index` - string (name of the index that is going to scanned)
* `key` - string (key to compare against while scanning the index)
* `array` - array (values match using an `or` operation during scan)
* `last` - string (key of the last evaluated item)
  * this is returned when you have more items in the table than is allowed by the limit

```js
table.find(name, params, last)
```
* `name` - string (table name that you wish to reference)
* `params` - object (key-value pairs to match using an `and` operation during scan)
* `last` - string (key of the last evaluated item)
  * this is returned when you have more items in the table than is allowed by the limit

```js
table.grab(name, params, last)
```
* `name` - string (table name that you wish to reference)
* `params` - object (key-value pairs to match using an `or` operation during scan)
* `last` - string (key of the last evaluated item)
  * this is returned when you have more items in the table than is allowed by the limit

```js
table.search(name, key, array, last)
```
* `name` - string (table name that you wish to reference)
* `key` - string (key to compare against while scanning the index)
* `array` - array (values match using an `or` operation during scan)
* `last` - string (key of the last evaluated item)
  * this is returned when you have more items in the table than is allowed by the limit

```js
table.create(name, params)
```
* `name` - string (table name that you wish to reference)
* `params` - object (key-value pairs be added to the table)

```js
table.update(name, id, params)
```
* `name` - string (table name that you wish to reference)
* `id` - string or number (id of the item you wish to update)
* `params` - object (key-value pairs update on the item)

```js
table.remove(name, params)
```
* `name` - string (table name that you wish to reference)
* `params` - object (map of keys that you wish to remove from an item)
  * you must pass in the id of the item you wish to remove

```js
table.delete(name, id)
```
* `name` - string (table name that you wish to reference)
* `id` - string or number (id of the item you wish to delete from the table)

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
