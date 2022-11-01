import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'mongoDB',
  connector: 'mongodb',
  url: 'mongodb://prog_web:progweb2022@ac-bu6vksr-shard-00-00.g6jdlc9.mongodb.net:27017,ac-bu6vksr-shard-00-01.g6jdlc9.mongodb.net:27017,ac-bu6vksr-shard-00-02.g6jdlc9.mongodb.net:27017/test?replicaSet=atlas-r9ob70-shard-0&ssl=true&authSource=admin',
  host: '',
  port: 0,
  user: '',
  password: 'progweb2022',
  database: '',
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MongoDbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mongoDB';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mongoDB', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
