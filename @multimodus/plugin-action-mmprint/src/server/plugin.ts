import { Logger, LoggerOptions } from '@nocobase/logger';
import { InstallOptions, Plugin } from '@nocobase/server';
import { resolve } from 'path';
import { print } from './actions/print';

export class PluginActionPrintServer extends Plugin {
	logger: Logger;

	afterAdd() {}

	beforeLoad() {
		this.logger = this.getLogger();
	}

	getLogger(): Logger {
		const logger = this.createLogger({
			dirname: 'mmprint',
			filename: '%DATE%.log',
		} as LoggerOptions);

		return logger;
	}

	async load() {
		await this.importCollections(resolve(__dirname, 'collections'));

		this.app.resource({
			name: 'mmprint',
			actions: {
				print: print.bind(this)
			},
		});

		this.app.acl.allow('mmprint', ['print', 'create', 'get', 'updateOrCreate'], 'loggedIn');
	}

	async install(options?: InstallOptions) {}

	async afterEnable() {}

	async afterDisable() {}

	async remove() {}
}

export default PluginActionPrintServer;
