import { Context, Next } from '@nocobase/actions';
import { parse } from '@nocobase/utils';
import path from 'path';
import { appendArrayColumn } from '@nocobase/evaluators';
import Application from '@nocobase/server';
import PrintPlugin from '../plugin';
import { buffer } from 'node:stream/consumers';
import { compileExpression } from "filtrex";
import carbone from 'carbone-sdk';

const carboneSDK = carbone();

const getHeaders = (headers: Record<string, any>) => {
	return Object.keys(headers).reduce((hds, key) => {
		if (key.toLocaleLowerCase().startsWith('x-')) {
			hds[key] = headers[key];
		}
		return hds;
	}, {});
};

const arrayToObject = (arr: { name: string; value: string }[]) => {
	return arr.reduce((acc, cur) => {
		acc[cur.name] = cur.value;
		return acc;
	}, {});
};

const omitNullAndUndefined = (obj: any) => {
	return Object.keys(obj).reduce((acc, cur) => {
		if (obj[cur] !== null && typeof obj[cur] !== 'undefined') {
			acc[cur] = obj[cur];
		}
		return acc;
	}, {});
};

const CurrentUserVariableRegExp = /{{\s*(currentUser[^}]+)\s*}}/g;

const getCurrentUserAppends = (str: string, user) => {
	const matched = str.matchAll(CurrentUserVariableRegExp);
	return Array.from(matched)
		.map((item) => {
			const keys = item?.[1].split('.') || [];
			const appendKey = keys[1];
			if (keys.length > 2 && !Reflect.has(user || {}, appendKey)) {
				return appendKey;
			}
		})
		.filter(Boolean);
};

export const getParsedValue = (value, variables) => {
	const template = parse(value);
	template.parameters.forEach(({ key }) => {
		appendArrayColumn(variables, key);
	});
	return template(variables);
};

export async function print(this: PrintPlugin, ctx: Context, next: Next) {
	const resourceName = ctx.action.resourceName;
	const { filterByTk, values = {} } = ctx.action.params;
	const {
		currentRecord = {
			id: 0
		},
		$nForm,
	} = values;
	this.logger.info(`mmprint:print:${filterByTk} current record: ${JSON.stringify(currentRecord)}`);

	const repo = ctx.db.getRepository(resourceName);
	const requestConfig = await repo.findOne({
		filter: {
			key: filterByTk,
		},
	});

	if (!requestConfig) {
		ctx.throw(404, 'print config not found');
	}

	ctx.withoutDataWrapping = true;

	const {
		dataSourceKey,
		collectionName,
		templateFile,
		appends,
		outputFormat,
		...options
	} = requestConfig.options || {};
	if (!templateFile) {
		return ctx.throw(400, ctx.t('Please configure the print settings first', { ns: 'action-mmprint' }));
	}
	let currentRecordValues = {};
	if (collectionName && typeof currentRecord.id !== 'undefined') {
		const app = ctx.app as Application;
		const dataSource = app.dataSourceManager.get(dataSourceKey || currentRecord.dataSourceKey || 'main');
		const recordRepo = dataSource.collectionManager.getRepository(collectionName);
		const safeAppends = appends && Array.isArray(appends) ? appends : [];
		currentRecordValues = (
			await recordRepo.findOne({
				filterByTk: currentRecord.id,
				appends: safeAppends.map(append => append.name)
			})
		)?.toJSON() || {};
		safeAppends.forEach(append => {
			if (append.filter) {
				const filter = compileExpression(append.filter);
				currentRecordValues[append.name] = currentRecordValues[append.name].filter(filter)
			}
		});
	}

	let currentUser = ctx.auth.user;

	const userAppends = getCurrentUserAppends(
		JSON.stringify(templateFile) + JSON.stringify(outputFormat),
		ctx.auth.user,
	);
	if (userAppends.length) {
		currentUser =
			(
				await ctx.db.getRepository('users').findOne({
					filterByTk: ctx.auth.user.id,
					appends: userAppends,
				})
			)?.toJSON() || {};
	}

	const variables = {
		currentRecord: {
			...currentRecordValues
		},
		currentUser,
		currentTime: new Date().toISOString(),
		$nToken: ctx.getBearerToken(),
		$nForm,
	};

	carboneSDK.setOptions({
		carboneUrl: process.env.CARBONE_BASE || 'http://localhost:4000/'
	});

	const carboneData = {
		data: variables,
		convertTo: outputFormat
	};

	try {
		const bname = path.basename(templateFile, path.extname(templateFile));
		const carboneStream = carboneSDK.render(
			templateFile,
			carboneData,
			{ headers: { 'carbone-template-delete-after': '0' } }
		);
		const buf = await buffer(carboneStream);

		ctx.set('Content-Disposition', `attachment; filename="${bname}.${outputFormat}"`);
		ctx.set('Content-Type' ,`application/${outputFormat}`);
		ctx.body = buf;
		this.logger.info(`mmprint:print:${filterByTk} carbone template rendered`);
	} catch (e) {
		this.logger.info(`mmprint:print:${filterByTk} carbone error: ${JSON.stringify(e)}`);
		ctx.status = 400;
		ctx.body = e;
	}

	return next();
}
