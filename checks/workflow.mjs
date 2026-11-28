export default function check({ notes, links }) {
	const findings = [];
	const checkedItems = [];
	let unverified = 0;
	for (const { path, properties } of notes) {
		if (properties.type !== 'garden-note' || properties.publish_ready !== true) continue;
		const privatePage = properties.visibility === 'private';
		const visibilityMessage = '该页面标为私有，同时被标记为拟分享。请核对页面的 visibility 与 publish_ready。';
		checkedItems.push({file:path, subject:'拟分享页面自身的 visibility',
			outcome:privatePage ? visibilityMessage : '页面未标记为私有。'});
		if (privatePage) findings.push({severity:'warning', code:'sharing-private-page', file:path, field:'visibility', message:visibilityMessage});
		const source = links?.[path];
		if (!source?.complete) {
			unverified++;
			findings.push({severity:'info', code:'sharing-reference-unverified', file:path, message:'该页面的链接清单未能完整核实。'});
		}
		const seen = new Set();
		let publicReferences = 0, privateReferences = 0;
		for (const reference of source?.references ?? []) {
			if (reference.status === 'missing' ||
				(reference.path && !/\.md$/iu.test(reference.path))) continue;
			if (reference.visibility === 'public') {
				publicReferences++;
				continue;
			}
			const target = reference.path ?? reference.target;
			if (seen.has(target)) continue;
			seen.add(target);
			const position = {file:path, line:reference.line, evidence:target?.slice(0, 1000)};
			if (reference.visibility === 'private') {
				privateReferences++;
				findings.push({...position, severity:'warning', code:'sharing-private-reference', message:'拟分享页面引用了明确标记为私有的页面。'});
			} else {
				unverified++;
				findings.push({...position, severity:'info', code:'sharing-reference-unverified',
					message:reference.path ? '未能确认链接目标的 visibility 属性。' : '未能核实该链接指向的实际页面。'});
			}
		}
		if (source?.complete || publicReferences + privateReferences) {
			checkedItems.push({file:path, subject:'拟分享页面引用的 Markdown 笔记 visibility',
				outcome:`已确认 ${publicReferences} 处公开引用，涉及 ${privateReferences} 个私有目标。`});
		}
	}
	return {findings, unverified, checkedItems};
}
