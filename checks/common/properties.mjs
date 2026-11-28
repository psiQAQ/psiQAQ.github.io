export default function checkProperties({result: check, notes, templateDirs}, {tr, addReason, recordChecked}) {
	for (const note of notes) {
		if (note.problem?.dynamic && templateDirs.some(dir => note.path.startsWith(dir + '/'))) {
			check.coverage.unknown++;
			addReason(check, tr('有模板的属性只有在实际插入时才能验证。','Check template properties after inserting the template into a note.'));
			continue;
		}
		recordChecked(check,note.path,tr('Markdown 的 YAML 属性语法','Markdown frontmatter syntax'),
			note.problem ? tr('属性语法无效','Invalid frontmatter syntax') : tr('未发现语法错误','No syntax errors found'),note.problem?.line);
		if (note.problem) check.diagnostics.push({severity: 'error', code: note.problem.code, line: note.problem.line,
			file: note.path, message: tr('Markdown 的 YAML 属性无效。','The Markdown frontmatter contains invalid YAML. Check the indicated line.')});
	}
	return check;
}
