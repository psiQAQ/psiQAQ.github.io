const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const side = new Set(['top','right','bottom','left']);
const arrow = new Set(['none','arrow']);
const type = new Set(['text','file','link','group']);
const backgrounds = new Set(['cover','ratio','repeat']);
const nonempty = value => typeof value === 'string' && !!value.trim();
const color = value => value === undefined || typeof value === 'string' && /^(?:#[0-9a-f]{6}|[1-6])$/iu.test(value);
const optionalEnum = (value, domain) => value === undefined || typeof value === 'string' && domain.has(value);

function pdfFragment(check, link, found, position, details, {tr, recordChecked}) {
	if (!link.fragment || !/\.pdf$/iu.test(found.path ?? link.target)) return false;
	const parts = link.fragment.slice(1).split('&');
	const pages = parts.filter(part => /^page(?:=|$)/iu.test(part)).map(part => part.slice(5));
	const hasLocation = parts.some(part => /^(?:selection|annotation)(?:=|$)/iu.test(part));
	if (hasLocation && found.status !== 'missing') {
		check.coverage.unknown++;
		check.diagnostics.push({...position,severity:'info',code:'unverified-pdf-location',
			message:tr('请打开 PDF 核对引用的选区或批注。','Open the PDF to verify the referenced selection or annotation.')});
	}
	if (!pages.length) {
		if (!hasLocation || found.status === 'missing') check.coverage.skipped++;
	} else if (pages.some(page => !/^\d+$/u.test(page) || !/[1-9]/u.test(page))) {
		recordChecked(check,position.file,`${details} · ${tr('PDF 页码参数','PDF page parameter')} ${found.path ?? link.target}${link.fragment}`,
			tr('页码不是正整数。','The page number is not a positive integer.'));
		check.diagnostics.push({...position,severity:'error',code:'invalid-pdf-page',
			message:tr('PDF 的 page 参数须为正整数，例如 #page=3。','Use a positive integer for the PDF page parameter, for example #page=3.')});
	} else if (found.status === 'missing') check.coverage.skipped++;
	else {
		check.coverage.unknown++;
		check.diagnostics.push({...position,severity:'info',code:'unverified-pdf-page',
			message:tr('未能确认 PDF 的总页数。请打开附件核对页码。','Could not verify the PDF page count. Open the attachment to check the page number.')});
	}
	return true;
}

function missingLink(target, kind, tr) {
	if (/\.(?:apng|avif|bmp|gif|jpe?g|png|svg|webp|ico|pdf|mp3|wav|m4a|ogg|flac|mp4|mov|mkv|webm|canvas|base|txt|csv|json|epub|zip)$/iu.test(target))
		return {severity:'error',code:'missing-attachment',message:tr('链接或嵌入的附件不存在。','The linked or embedded attachment is missing. Restore it or update the link.')};
	if (kind === 'embed' || target.includes('/') || /\.md$/iu.test(target))
		return {severity:'error',code:'missing-link-target',message:tr('显式链接或嵌入的目标文件不存在。','The explicit link or embed points to a missing file. Check its path.')};
	return {severity:'info',code:'uncreated-note',message:tr('链接指向尚未创建的笔记。','The link points to a note that has not been created yet.')};
}

export default function checkCanvas({result: check, canvases}, tools) {
	const {tr, addReason, validText, recordChecked, recordLinkPlaceholder} = tools;
	let deferred = false;
	let unresolved = false;
	for (const {file, data, references, unreadable, malformed, portabilityIncluded} of canvases) {
		function fail(code, message, evidence) {check.diagnostics.push({severity:'error',code,message,file,evidence});}
		if (unreadable) {
			check.coverage.unknown++;
			check.diagnostics.push({severity:'info',code:'unreadable-file',file,message:tr('文件不可读或超出检查范围限制。','Could not read the file within the scan limits.')});
			addReason(check,tr('部分检查文件未能读取。','Some files for this check could not be read.'));
			continue;
		}
		const structure = tr('Canvas 文件结构与引用语法','Canvas document structure and reference syntax');
		const structureMessage = tr('Canvas 须含可选的节点与连线数组。','Use arrays for nodes and edges when those fields are present.');
		if (malformed || !isRecord(data) || (data.nodes !== undefined && !Array.isArray(data.nodes))) {
			const message = malformed ? tr('Canvas 内容不是有效 JSON。','The Canvas file contains invalid JSON.') : structureMessage;
			fail(malformed ? 'canvas-json' : 'canvas-structure',message);
			recordChecked(check,file,structure,malformed ? message : tr('Canvas 根对象或节点数组无效。','The Canvas root object or nodes array is invalid.'));
			continue;
		}
		const structureProblems = new Set();
		function failStructure(code, message, evidence) {
			fail(code,message,evidence);
			structureProblems.add([evidence,message].filter(Boolean).join(' · '));
		}
		if (data.edges !== undefined && !Array.isArray(data.edges)) failStructure('canvas-structure',structureMessage);

		function inspectTarget(ref, details) {
			if (!ref) failStructure('canvas-file-path',tr('Canvas 文件路径不是有效的 Vault 相对路径。','Use a valid vault-relative path for the Canvas file reference.'),details);
			else inspectReference(ref,details);
		}
		function inspectReference(ref, details) {
			if (ref.kind === 'external') {check.coverage.skipped++; return;}
			if (ref.kind === 'invalid-encoding') {
				failStructure('canvas-link-encoding',tr('Canvas 文本节点的链接包含无效 URL 转义。','The Canvas text node contains a link with invalid URL encoding.'),details);
				return;
			}
			if (ref.kind === 'template') {
				recordLinkPlaceholder(check,ref.placeholder,{file,evidence:details});
				if (ref.placeholder.coverage === 'skipped') deferred = true;
				if (ref.placeholder.coverage === 'unknown') unresolved = true;
				return;
			}
			const {link, found, cross} = ref;
			const exact = link.canvasPath;
			const evidence = [ref.evidence,details].filter(Boolean).join(' · ');
			if (!portabilityIncluded && cross) check.diagnostics.push({file,evidence:[cross.evidence,details].join(' · '),severity:'info',code:'cross-library-link',
				message:tr('Canvas 引用解析到当前知识库之外的 Vault 文件。','The Canvas reference resolves to a vault file outside this library.')});
			const unknownBefore = check.coverage.unknown;
			const pdf = pdfFragment(check,link,found,{file,evidence},details,tools);
			if (found.status === 'unknown') {
				check.coverage.unknown++;
				check.diagnostics.push({file,evidence,severity:'info',code:exact ? 'canvas-target-unverified' : 'canvas-text-link-unverified',
					message:validText(found.reason,512) ? found.reason : exact
						? tr('未能确认 Canvas 引用的文件。','Could not verify the Canvas file reference.')
						: tr('未能确认 Canvas 文本节点中的链接。','Could not verify the link in the Canvas text node.')});
			} else {
				const subject = `${details} · ${tr('引用目标','Reference target')} ${link.target || link.source}`;
				const reference = subject + (link.fragment ?? '');
				if (found.status === 'missing') {
					recordChecked(check,file,reference,tr('目标文件不存在。','The target file is missing.'));
					if (exact) fail('canvas-target-missing',tr('Canvas 引用的文件不存在。','The Canvas references a missing file. Restore it or update the node.'),evidence);
					else check.diagnostics.push({file,evidence,...missingLink(link.target,link.kind,tr)});
				} else {
					const resolved = `${cross ? tr('已解析到库外文件','Resolved to a file outside this library') : tr('已解析到','Resolved to')} ${cross?.evidence ?? found.path}`;
					if (pdf || !link.fragment) recordChecked(check,file,subject,resolved);
					else if (!found.anchor || found.anchor === 'unknown') {
						check.coverage.unknown++;
						if (exact) recordChecked(check,file,subject,resolved);
						else check.diagnostics.push({file,evidence,severity:'info',code:'canvas-text-link-unverified',message:tr('未能确认文本节点中的链接片段。','Could not verify the link fragment in the Canvas text node.')});
					} else if (found.anchor === 'missing') {
						recordChecked(check,file,reference,`${tr('目标文件中不存在指定的标题、块或视图。','The specified heading, block, or view is missing.')} ${resolved}`);
						fail('canvas-anchor-missing',tr('Canvas 引用的标题、块或视图不存在。','The Canvas references a missing heading, block, or view. Check its fragment.'),evidence);
					} else recordChecked(check,file,reference,`${tr('目标文件包含指定的标题、块或视图。','The target contains the specified heading, block, or view.')} ${resolved}`);
				}
			}
			if (check.coverage.unknown > unknownBefore) unresolved = true;
		}
		const ids = new Set();
		for (const [index, node] of (data.nodes ?? []).entries()) {
			const details = `${tr('节点','Node')} ${validText(node?.id,128) ? node.id : `#${index + 1}`}`;
			if (!isRecord(node) || !nonempty(node.id) || typeof node.type !== 'string' || !type.has(node.type) ||
				!['x','y','width','height'].every(key => Number.isSafeInteger(node[key])) || !color(node.color)) {
				failStructure('canvas-node',tr('Canvas 节点的 ID、类型、坐标、尺寸或颜色无效。','Check the Canvas node’s ID, type, coordinates, dimensions, and color.'),details); continue;
			}
			if (ids.has(node.id)) failStructure('canvas-duplicate-node',tr('Canvas 节点 ID 重复。','Give each Canvas node a unique ID.'),details);
			ids.add(node.id);
			if (node.type === 'text') {
				if (typeof node.text !== 'string') failStructure('canvas-text-node',tr('Canvas 文本节点没有文本。','Supply a text string for the Canvas text node.'),details);
				else for (const ref of references[index]) inspectReference(ref,ref.line ? details + ' · ' + tr('文本行','Text line') + ' ' + ref.line : details);
			}
			if (node.type === 'link' && !nonempty(node.url)) failStructure('canvas-link-node',tr('Canvas 链接节点没有 URL。','Supply a URL for the Canvas link node.'),details);
			if (node.type === 'group' && ((node.label !== undefined && typeof node.label !== 'string') || !optionalEnum(node.backgroundStyle, backgrounds)))
				failStructure('canvas-group-node',tr('Canvas 分组标题或背景样式无效。','Check the Canvas group label and background style.'),details);
			if (node.type === 'file') {
				if (node.subpath !== undefined && (typeof node.subpath !== 'string' || !node.subpath.startsWith('#')))
					failStructure('canvas-subpath',tr('Canvas 文件节点的子路径须以 # 开头。','Start the Canvas file node’s subpath with #.'),details);
				inspectTarget(references[index][0],details);
			}
			if (node.type === 'group' && node.background !== undefined) inspectTarget(references[index][0],details);
		}
		const edges = new Set();
		for (const [index,edge] of (Array.isArray(data.edges) ? data.edges : []).entries()) {
			const details = `${tr('连线','Edge')} ${validText(edge?.id,128) ? edge.id : `#${index + 1}`}`;
			if (!isRecord(edge) || !nonempty(edge.id) || !nonempty(edge.fromNode) || !nonempty(edge.toNode) ||
				!color(edge.color) || !optionalEnum(edge.fromSide, side) || !optionalEnum(edge.toSide, side) ||
				!optionalEnum(edge.fromEnd, arrow) || !optionalEnum(edge.toEnd, arrow) || (edge.label !== undefined && typeof edge.label !== 'string')) {
				failStructure('canvas-edge',tr('Canvas 连线的 ID、端点或样式无效。','Check the Canvas edge’s ID, endpoints, and style.'),details); continue;
			}
			if (edges.has(edge.id)) failStructure('canvas-duplicate-edge',tr('Canvas 连线 ID 重复。','Give each Canvas edge a unique ID.'),details);
			edges.add(edge.id);
			if (!ids.has(edge.fromNode) || !ids.has(edge.toNode)) failStructure('canvas-dangling-edge',tr('Canvas 连线引用不存在的节点。','Update or remove the edge that points to a missing Canvas node.'),details);
		}
		recordChecked(check,file,structure,structureProblems.size
			? [tr('发现结构或语法问题。','Found structural or syntax problems.'),...structureProblems].join(' · ')
			: tr('Canvas 结构与引用语法有效。','The Canvas structure and reference syntax are valid.'));
	}
	if (deferred) addReason(check,tr('Canvas 中的部分模板链接待实例化后检查。','Check deferred Canvas template links after their variables are filled in.'));
	if (unresolved) addReason(check,tr('部分 Canvas 引用或链接未能确认。','Some Canvas references or links could not be verified.'));
	return check;
}
