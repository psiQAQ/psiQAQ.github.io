export default function checkManifest({result: check, registration, manifest, template, inventory}, {tr, addReason, recordChecked}) {
	const {parsed} = manifest;
	recordChecked(check,'kb.toml',tr('清单格式与知识库身份','Manifest format and library identity'),
		!parsed ? manifest.reason : parsed.identity ? tr('已读取知识库身份','Library identity found') : tr('缺少受管身份','Managed identity missing'));
	if (!parsed) check.diagnostics.push({severity: 'error', code: 'invalid-manifest', file: 'kb.toml', message: manifest.reason});
	else if (!parsed.identity) check.diagnostics.push({severity: 'warning', code: 'legacy-identity', file: 'kb.toml', message: tr('清单没有受管知识库身份。','The manifest has no managed library identity. Review it before adopting this library.')});
	if (template.reason) {
		recordChecked(check,'kb-template.json',tr('来源模板声明','Source template declaration'),template.reason);
		check.diagnostics.push({severity: 'error', code: 'invalid-template', file: 'kb-template.json', message: template.reason});
	}
	if (template.template) {
		const identity = parsed?.identity?.template;
		const comparable = identity && identity.id !== 'unknown';
		const drift = comparable && (identity.id !== template.template.id || identity.version !== template.template.version);
		recordChecked(check,'kb-template.json',tr('来源模板的 ID 与版本','Source template ID and version'),
			(drift ? tr('与实例清单不同','Differs from the library manifest') : comparable ? tr('与实例清单一致','Matches the library manifest') :
				tr('已读取模板，实例清单没有可比较的来源','Template read. No comparable source in the library manifest')) + ' · ' + template.template.id + ' ' + template.template.version);
		if (drift)
			check.diagnostics.push({severity: 'warning', code: 'template-version-drift', file: 'kb-template.json', message: tr('模板声明的 ID 或版本与实例清单不同。','The template ID or version differs from the library manifest. Review both files.')});
	}
	function verifyPath(file, candidates, missing) {
		if (!candidates.includes(file)) {
			const directory = inventory.unreadableDirectories.find(dir => file === dir || file.startsWith(dir + '/'));
			if (directory) {
				check.coverage.unknown++;
				const message = tr('无法扫描清单路径所在的目录。','Could not scan the directory that contains the configured path.');
				check.diagnostics.push({severity:'info', code:'manifest-path-unverified', file, evidence:directory, message});
				addReason(check, tr('部分清单路径所在的目录无法遍历。','Some configured paths are in directories that could not be scanned.'));
				return;
			}
			check.diagnostics.push({...missing, file});
		}
		recordChecked(check,file,missing.code === 'missing-entry' ? tr('入口文件','Entry file') : tr('清单路径','Configured path')+' · '+missing.evidence,
			candidates.includes(file) ? tr('路径存在','Path exists') : tr('找不到指定路径','Configured path not found'));
	}
	const entry = parsed?.identity?.entry ?? template.template?.entry;
	if (entry) verifyPath(entry, inventory.files, {severity:'error', code:'missing-entry',
		message:tr('清单指定的入口文件不存在。','The configured entry file is missing. Restore it or update its path.')});
	for (const [role, relative] of Object.entries(manifest.paths ?? {})) {
		if (relative === entry) continue;
		const candidates = ['overview','index','log'].includes(role) ? inventory.files : inventory.directories;
		verifyPath(relative, candidates, {severity:'error', code:'missing-mapping',
			message:tr('清单映射的文件或目录不存在。','The mapped file or folder is missing. Check the path in kb.toml.'), evidence:role});
	}
	if (registration.registered === undefined) {
		check.coverage.unknown++;
		addReason(check, tr('当前入口未提供 Vault 登记状态。','Run the check in the library manager to verify vault registration.'));
	} else {
		recordChecked(check,'kb.toml',tr('Vault 中的知识库登记','Library registration in the vault'),
			registration.registered ? tr('已登记','Registered') : tr('未登记','Unregistered'));
		if (!registration.registered) check.diagnostics.push({severity: 'warning', code: 'unregistered-library', message: tr('当前 Vault 没有登记本库。','This library is not registered in the current vault.')});
	}
	if (registration.duplicate === undefined) {
		check.coverage.unknown++;
		addReason(check, tr('当前入口未提供知识库身份重复检查结果。','The current entry point did not provide the result of the duplicate library identity check.'));
	} else {
		recordChecked(check,'kb.toml',tr('已登记库中的身份唯一性','Identity uniqueness across registered libraries'),
			registration.duplicate ? tr('有重复身份','Duplicate identity found') : tr('身份唯一','Unique identity'));
		if (registration.duplicate) check.diagnostics.push({severity: 'error', code: 'duplicate-library', file: 'kb.toml', message: tr('Vault 已登记另一处具有相同身份的知识库。','Another registered library has the same identity. Review the duplicate registration.')});
	}
	return check;
}
