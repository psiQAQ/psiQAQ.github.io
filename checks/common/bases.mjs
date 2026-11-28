const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = value => typeof value === 'string' && !!value.trim();

function validFilter(value, depth = 0) {
	if (nonempty(value)) return true;
	if (depth >= 32 || !isRecord(value)) return false;
	const entries = Object.entries(value);
	if (entries.length !== 1) return false;
	const [operator, operands] = entries[0];
	return ['and','or','not'].includes(operator) && Array.isArray(operands) && operands.every(item => validFilter(item, depth + 1));
}

function deferredFilter(value, field, deferredFields) {
	if (typeof value === 'string') return deferredFields.has(field);
	const [operator, operands] = Object.entries(value)[0];
	return operands.length > 0 && operands.every((child, index) => deferredFilter(child, `${field}.${operator}[${index}]`, deferredFields));
}

export default function checkBases({result: check, files, notes, noteCoverage}, {tr, addReason, recordChecked}) {
	let dynamicExpressions = 0;
	function recordExpression(file, line, scope, value) {
		dynamicExpressions++;
		check.baseExpressionCount = dynamicExpressions;
		const samples = check.baseExpressions ??= [];
		if (samples.length >= 40) return;
		// Keep grouped filters readable and preserve the meaning of nested and/or/not.
		function* parts(filter) {
			if (typeof filter === 'string') {yield filter; return;}
			const [operator, children] = Object.entries(filter)[0];
			yield operator + ' (';
			for (const [index, child] of children.entries()) {
				if (index) yield ', ';
				yield* parts(child);
			}
			yield ')';
		}
		let expression = '';
		for (const part of parts(value)) {
			expression += part.slice(0,513 - expression.length);
			if (expression.length > 512) {expression = expression.slice(0,511) + '…'; break;}
		}
		samples.push({file,line,scope:scope.slice(0,256),expression});
	}
	function inspectPaths(file, paths = []) {
		for (const {status, kind, field, line, column, expression, value, exclusion, placeholder} of paths) {
			const evidence = Array.from(value === undefined ? expression : JSON.stringify(value), character => {
				const code = character.charCodeAt(0);
				return code < 32 || code === 127 ? '\\u' + code.toString(16).padStart(4,'0') : character;
			}).join('');
			const position = {file,field,line,column,evidence};
			if (placeholder === 'deferred') {
				check.coverage.skipped++;
				check.diagnostics.push({...position,severity:'info',code:'base-path-template-deferred',message:tr(
					'此模板路径待实例化。','Check this template path after filling in the instance variable.')});
				addReason(check,tr('模板路径待实例化后检查。','Check deferred template paths after filling in their variables.'));
				continue;
			}
			if (status === 'unverified') {
				check.coverage.unknown++;
				const message = placeholder === 'unsubstituted'
					? tr('实例路径尚未填写。','The instance path still contains a template placeholder.')
					: tr('此过滤条件的路径无法静态确认。','The filter path could not be verified statically.');
				check.diagnostics.push({...position,severity:'info',code:'base-path-unverified',message});
				addReason(check,tr('部分过滤器路径需要在 Vault 中确认。','Some filter paths need to be verified in the vault.'));
				continue;
			}
			const outcome = status === 'relative' ? tr('以 ./ 或 ../ 开头，不能按文件所在目录解析','Relative to the file rather than the vault root') :
				kind === 'link' ? status === 'missing' ? tr('Vault 中未找到链接目标','Link target not found in the vault') : tr('Vault 中的链接目标存在','Link target exists in the vault') :
				exclusion ? tr('目录不存在，排除条件未命中任何路径','The folder is absent, so the exclusion matches no paths') :
					status === 'missing' ? tr('Vault 中未找到目录','Folder not found in the vault') : tr('Vault 中的目录存在','Folder exists in the vault');
			recordChecked(check,file,field + ' · ' + expression,outcome + ' · ' + value,line);
			if (status === 'relative') check.diagnostics.push({...position,severity:'warning',code:'base-path-relative',message:tr(
				'Bases 路径以 Vault 根目录为基准。请检查 ./ 或 ../ 开头的路径。','Bases paths are relative to the vault root. Review the path beginning with ./ or ../.')});
			if (status === 'missing' && kind === 'link') check.diagnostics.push({...position,severity:'info',code:'base-link-missing-target',message:tr(
				'Vault 中未找到过滤器链接的目标文件。','The file linked by the filter was not found in the vault.')});
			else if (status === 'missing' && !exclusion) check.diagnostics.push({...position,severity:'info',code:'base-path-missing-folder',message:kind === 'inFolder'
				? tr('Vault 中未找到过滤器指定的文件夹。','The folder used by the filter was not found in the vault.')
				: tr('Vault 中未找到此前缀指向的文件夹。','The folder used as a path prefix was not found in the vault.')});
		}
	}
	function inspect(file, base, line, paths) {
		function fail(code, message) {check.diagnostics.push({severity:'error', code, message, file, line});}
		if (base === null) return;
		if (!isRecord(base)) {fail('base-yaml',tr('Base 文件须为有效的 YAML 映射。','Use a valid YAML mapping for the Base.')); return;}
		if (base.views !== undefined && (!Array.isArray(base.views) || !base.views.every(isRecord))) {
			fail('base-views',tr('Base 视图须为映射数组。','Define the Base views as a list of mappings.')); return;
		}
		const views = base.views ?? [];
		if (views.some(view => !nonempty(view.type) || !nonempty(view.name))) fail('base-view-identity',tr('Base 视图须声明类型和名称。','Supply a type and name for every Base view.'));
		if (base.properties !== undefined && (!isRecord(base.properties) || !Object.values(base.properties).every(isRecord)))
			fail('base-properties',tr('Base 属性配置须为映射。','Use a mapping for each Base property configuration.'));
		for (const field of ['formulas','summaries']) {
			const value = base[field];
			if (value === undefined) continue;
			if (!isRecord(value) || !Object.values(value).every(nonempty)) fail('base-expression',tr('Base 表达式须为非空字符串。','Write each Base expression as a nonempty string.'));
			else for (const [name,expression] of Object.entries(value)) recordExpression(file,line,field + '.' + name,expression);
		}
		const deferredFields = new Set(paths.filter(path => path.placeholder === 'deferred' && path.wholeFilter).map(path => path.field));
		for (const [index,scope] of [base, ...views].entries()) {
			if (scope.filters === undefined) continue;
			if (!validFilter(scope.filters)) fail('base-filter',tr('Base 过滤器须用语句或 and/or/not 的嵌套列表。','Use an expression or nested and/or/not lists for the Base filter.'));
			else if (!deferredFilter(scope.filters,index ? `views[${index - 1}].filters` : 'filters',deferredFields))
				recordExpression(file,line,scope === base ? tr('全局筛选','Global filter') :
				tr('视图筛选','View filter') + ' · ' + (typeof scope.name === 'string' ? scope.name : '—'),scope.filters);
		}
	}
	function checkStructure(file, data, paths, line) {
		const before = check.diagnostics.length;
		inspect(file,data,line,paths ?? []);
		const errors = check.diagnostics.slice(before);
		const outcome = errors.length ? errors.map(item=>item.message).join(' ') :
			tr('结构有效，视图数','Valid structure. Views') + ' · ' + (data?.views?.length ?? 0);
		recordChecked(check,file,tr('Base 的 YAML、视图与筛选结构','Base YAML, view and filter structure'),outcome,line);
	}
	for (const {file, data, paths, unreadable} of files) {
		if (unreadable) {
			check.coverage.unknown++;
			check.diagnostics.push({severity:'info', code:'unreadable-file', file, message:tr('文件不可读或超出检查范围限制。','Could not read the file within the scan limits.')});
			addReason(check, tr('部分检查文件未能读取。','Some files for this check could not be read.'));
		} else {
			checkStructure(file, data, paths);
			inspectPaths(file, paths);
		}
	}
	check.coverage.unknown += noteCoverage.coverage.unknown;
	check.diagnostics.push(...noteCoverage.diagnostics);
	if (noteCoverage.reason) addReason(check, noteCoverage.reason);
	for (const {file, problem, blocks} of notes) {
		if (problem?.code === 'unclosed-frontmatter') {
			check.coverage.unknown++;
			const message = tr('未找到 YAML 属性的结束标记，无法检查正文中的 Base 代码块。','Could not scan the body for Base blocks because the frontmatter has no closing delimiter.');
			check.diagnostics.push({severity:'info', code:'unverified-markdown-body', file, line:problem.line, message});
			addReason(check, tr('部分 Markdown 正文无法与属性分开。','Some Markdown bodies could not be separated from their frontmatter.'));
		}
		for (const {data, line, paths} of blocks) {
			checkStructure(file, data, paths, line);
			inspectPaths(file, paths);
		}
	}
	check.coverage.unknown += dynamicExpressions;
	if (dynamicExpressions) addReason(check, tr('动态表达式的运行结果须在 Obsidian 中确认。','Open the Base in Obsidian to verify the results of dynamic expressions.'));
	return check;
}
