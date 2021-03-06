import morgan from 'morgan';
import bodyParser from 'body-parser';
import contentLength from 'express-content-length-validator';
import helmet from 'helmet';
import path from 'path';
import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import * as ngUniversal from '@nguniversal/express-engine';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

import {
  APP_PATH,
  HOST,
} from '../../config/constants';
import ApiRouter from './api.router';

const root = process.cwd();
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require(path.join(root, 'dist-server', 'main'));

export default class RouteConfig {
  static init(app, express) {
    /* Configure Angular Express engine */
    app.engine('html', ngUniversal.ngExpressEngine({
      bootstrap: AppServerModuleNgFactory,
      providers: [
        provideModuleMap(LAZY_MODULE_MAP),
      ],
    }));
    app.set('view engine', 'html');
    app.set('views', 'dist');


    app.use('/lib', express.static(`${root}/node_modules`));
    app.use('/static', express.static(root + APP_PATH.CLIENT_FILES));


    app.use('/', express.static(root + APP_PATH.CLIENT_FILES));

    // TODO 404 page
    app.use(morgan('dev'));
    app.use(express.json());
    app.use('/api', ApiRouter);

    app.get('*', (req, res) => {
      const { accept } = req.headers;
      if (accept && accept.includes('text/html')) {
        // client responsability
        res.render('index', {
          req,
          res,
          providers: [{
            provide: 'serverUrl',
            useValue: `${req.protocol}://${HOST || req.get('host')}`,
          }],
        });
      } else {
        res.status(404).send('404 not found');
      }
    });


    app.use(bodyParser.json());
    app.use(contentLength.validateMax({
      max: 999,
    }));
    app.use(helmet());

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true,
    }));
  }
}
