// Preserves the supplied visual markup; generates pages that use the React
// components/hooks in src rather than importing or executing the old scripts.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'parse5';

const source = process.argv[2];
if (!source) throw new Error('Pass the original source directory.');
const q = JSON.stringify;
const pages = JSON.parse(fs.readFileSync('src/pages.json', 'utf8'));
const voids = new Set(
  'area base br col embed hr img input link meta param source track wbr'.split(' ')
);
const bools = new Set(
  'autofocus checked disabled hidden multiple readonly required selected'.split(' ')
);
const props = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  contenteditable: 'contentEditable',
  autofocus: 'autoFocus',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  enctype: 'encType',
  autocomplete: 'autoComplete',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
};
const attr = (n, key) => n.attrs?.find((a) => a.name === key)?.value;
const children = (n) => n.childNodes || [];
const text = (n) => n.value || children(n).map(text).join('');
function walk(n, fn) {
  fn(n);
  for (const c of children(n)) walk(c, fn);
}
function styles(value) {
  return Object.fromEntries(
    value
      .split(';')
      .filter((line) => line.includes(':'))
      .map((line) => {
        const i = line.indexOf(':');
        return [
          line
            .slice(0, i)
            .trim()
            .replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
          line.slice(i + 1).trim(),
        ];
      })
  );
}
for (const page of pages) {
  const original = fs.readFileSync(path.join(source, page.path), 'utf8');
  const doc = parse(original.replace(/^<\?php[\s\S]*?\?>/, ''));
  let body;
  const ids = {};
  walk(doc, (n) => {
    if (n.tagName === 'body') body = n;
    const id = attr(n, 'id');
    if (id) ids[id] = n;
  });
  const relativePrefix = '../'.repeat(page.path.split('/').length);
  const imports = new Map();
  function use(name, file, kind = 'default') {
    imports.set(
      name,
      `import ${kind === 'default' ? name : '{' + name + '}'} from '${relativePrefix}${file}';`
    );
  }
  use('Link', 'routing', 'named');
  use('assetUrl', 'routing', 'named');
  const declarations = [];
  const isProfile = ['profile2.html', 'file-injection.html'].includes(page.path);
  const isAdmin = page.path === 'access/admin.html';
  const isAccess = page.path === 'access/access.html';
  const isExam = Boolean(ids.examResultsForm);
  const hasSql = Boolean(ids['sql-demo']);
  const hasDisclaimer = Boolean(ids.acceptDisclaimer);
  const tutorial = page.path.startsWith('tutorial/');
  if (hasSql) {
    use('useSqlDemo', 'hooks/useSqlDemo');
    declarations.push('const sql = useSqlDemo();');
  }
  if (hasDisclaimer)
    declarations.push('const [disclaimerVisible,setDisclaimerVisible] = useState(true);');
  if (ids.vulnerabilitiesModal) {
    use('VulnerabilityModal', 'components/VulnerabilityModal');
    declarations.push('const [course,setCourse] = useState(null);');
  }
  if (isAccess) {
    use('useAccess', 'hooks/useAccess');
    declarations.push('const access = useAccess();');
  }
  if (isAdmin) {
    use('useAdmin', 'hooks/useAdmin');
    declarations.push('const admin = useAdmin();');
  }
  if (isProfile) {
    use('useProfile', 'hooks/useProfile');
    declarations.push(
      `const profile = useProfile(${q({ name: text(ids.displayName), email: text(ids.displayEmail), bio: text(ids.displayBio), avatar: attr(ids.avatarPreview, 'src') })},${page.path === 'file-injection.html'});`
    );
  }
  if (ids['module1-progress'])
    declarations.push('const [progress,setProgress] = useState([75,50,20]);');
  if (isExam) {
    use('ExamResults', 'components/ExamResults');
    declarations.push(
      "const [examQuery,setExamQuery] = useState('');",
      'const [submittedQuery,setSubmittedQuery] = useState(null);'
    );
  }
  if (ids.nameInput)
    declarations.push(
      "const [name,setName] = useState('');",
      "const [greeting,setGreeting] = useState('');"
    );
  function url(value) {
    if (!value || /^(?:https?:|data:|mailto:|tel:|#|\/\/)/.test(value)) return null;
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(page.path), value));
    return (
      {
        'process.php': 'api/labs/reflected-xss',
        'uploads/process.php': 'api/labs/reflected-xss',
        'csrfprocess.php': 'api/labs/csrf',
        'upload.php': 'api/uploads',
        'upload2.php': 'api/uploads/avatar',
        'testupload.php': 'api/labs/file-upload',
        'download.php': 'api/download',
      }[resolved] || resolved
    );
  }
  function childMarkup(n) {
    return children(n)
      .map((c) => jsx(c))
      .join('\n');
  }
  function jsx(n) {
    if (n.nodeName === '#text') return n.value.trim() || n.value === ' ' ? `{${q(n.value)}}` : '';
    if (!n.tagName || ['script', 'style', 'link'].includes(n.tagName)) return '';
    const id = attr(n, 'id');
    if (n.tagName === 'div') {
      const button = children(n).find(
        (c) => c.tagName === 'button' && attr(c, 'onclick')?.startsWith('toggleFaq')
      );
      if (button) {
        use('FaqItem', 'components/FaqItem');
        const spans = children(button).filter((c) => c.tagName === 'span');
        const answer = children(n).find((c) => c.tagName === 'div');
        return `<FaqItem className={${q(attr(n, 'class'))}} buttonClass={${q(attr(button, 'class'))}} iconClass={${q(attr(spans.at(-1), 'class'))}} answerClass={${q(attr(answer, 'class'))}} question={<>${jsx(spans[0])}</>}>${childMarkup(answer)}</FaqItem>`;
      }
    }
    if (id === 'terminal' && page.path !== 'terminalfeature.html') {
      use('QuizTerminal', 'components/QuizTerminal');
      const welcomeNode = children(n).find((c) => c.tagName === 'div' && !attr(c, 'class'));
      const welcome = welcomeNode ? jsx(welcomeNode) : `{${q(text(n).trim())}}`;
      return `<QuizTerminal id="terminal" className={${q(attr(n, 'class'))}} tabIndex={0} autoFocus={${['test.html', 'testcopy.html', 'testcopy2.html'].includes(page.path)}} welcome={<>${welcome}</>} />`;
    }
    if (id === 'terminal' && page.path === 'terminalfeature.html') {
      use('NetworkTerminal', 'components/NetworkTerminal');
      return '<NetworkTerminal />';
    }
    if (id === 'terminal-container') {
      use('LinuxTerminal', 'components/LinuxTerminal');
      return '<LinuxTerminal />';
    }
    if (id === 'vulnerabilitiesModal')
      return '<VulnerabilityModal course={course} onClose={()=>setCourse(null)} />';
    if (page.path === 'XSS.html' && n.tagName === 'main') {
      use('PostBoard', 'components/PostBoard');
      return `<main className={${q(attr(n, 'class'))}}><PostBoard /></main>`;
    }

    const overrides = {};
    if (page.path === 'testupload.html' && n.tagName === 'form')
      overrides.action = 'assetUrl("api/labs/file-upload")';
    let append = '',
      content = null;
    if (hasSql) {
      if (id === 'username') {
        overrides.value = 'sql.username';
        append += ' ref={sql.usernameRef} onChange={event=>sql.setUsername(event.target.value)}';
      }
      if (id === 'password') {
        overrides.value = 'sql.password';
        append += ' onChange={event=>sql.setPassword(event.target.value)}';
      }
      if (id === 'sql-demo')
        append += ' onSubmit={event=>{event.preventDefault();sql.checkLogin();}}';
      if (id === 'output') content = '{sql.output}';
      if (id === 'info') content = '{sql.info}';
    }
    if (isAccess) {
      if (id === 'accessCode') {
        overrides.value = 'access.code';
        append += ' onChange={event=>access.setCode(event.target.value)}';
      }
      if (id === 'accessForm') append += ' onSubmit={access.submit}';
      if (n.tagName === 'button' && attr(n, 'type') === 'submit')
        overrides.disabled = 'access.pending';
      if (id === 'message') {
        content = '{access.message}';
        overrides.style = "{color:access.message?'red':undefined}";
      }
    }
    if (isAdmin) {
      if (id === 'generateForm') append += ' onSubmit={admin.generate}';
      if (id === 'viewCodesBtn') append += ' onClick={admin.viewCodes}';
      if (id === 'cleanupBtn') append += ' onClick={admin.cleanup}';
      if (id === 'codesListContainer')
        overrides.className = `admin.codes === null ? ${q(attr(n, 'class'))} : ${q(attr(n, 'class').replace(/\bhidden\s*/, ''))}`;
      if (id === 'codesList')
        content =
          '{admin.codes?.length ? admin.codes.map(item=><li key={item.code}>Code: {item.code} - Expires At: {item.expires_at}</li>) : <li>No codes found.</li>}';
    }
    if (isProfile) {
      if (id === 'editButton') append += ' onClick={profile.edit}';
      if (id === 'profileForm') {
        append += ' onSubmit={profile.save}';
        overrides.className = `profile.editing ? ${q(attr(n, 'class').replace(/\bhidden\s*/, ''))} : ${q(attr(n, 'class'))}`;
      }
      if (id === 'profileDisplay') overrides.className = "profile.editing ? 'hidden' : undefined";
      if (['name', 'email', 'bio'].includes(id)) {
        overrides.value = `profile.draft.${id}`;
        append += ` onChange={profile.field('${id}').onChange}`;
      }
      if (id === 'avatar')
        append += ' onChange={event=>profile.setFile(event.target.files[0] || null)}';
      if (id === 'avatarPreview') overrides.src = 'profile.profile.avatar';
      if (id?.startsWith('display'))
        content = `{profile.profile.${{ displayName: 'name', displayEmail: 'email', displayBio: 'bio' }[id]}}`;
    }
    if (ids['module1-progress']) {
      const match = id?.match(/^module(\d)-progress$/);
      if (match) overrides.style = `{width:progress[${Number(match[1]) - 1}]+'%'}`;
      if (n.tagName === 'p' && /% completed/.test(text(n))) {
        const sibling = children(n.parentNode).find((c) => c.tagName === 'div');
        const bar = children(sibling).find((c) => attr(c, 'id')?.match(/^module\d-progress$/));
        if (bar) content = `{progress[${Number(attr(bar, 'id').match(/\d/)[0]) - 1}]}% completed`;
      }
    }
    if (isExam) {
      if (id === 'examQuery') {
        overrides.value = 'examQuery';
        append += ' onChange={event=>setExamQuery(event.target.value)}';
      }
      if (id === 'examResultsForm')
        append += ' onSubmit={event=>{event.preventDefault();setSubmittedQuery(examQuery);}}';
      if (id === 'examResults') content = '<ExamResults query={submittedQuery} />';
    }
    if (ids.nameInput) {
      if (id === 'nameInput') {
        overrides.value = 'name';
        append += ' onChange={event=>setName(event.target.value)}';
      }
      if (id === 'greeting' && page.path === 'uploads/index.html')
        append += ' dangerouslySetInnerHTML={{__html:greeting}}';
    }
    let tag = n.tagName;
    if (tag === 'a') {
      let local = url(attr(n, 'href'));
      if (
        local &&
        !pages.some((p) => p.path === local) &&
        pages.some((p) => p.path === attr(n, 'href'))
      )
        local = attr(n, 'href');
      if (local && pages.some((p) => p.path === local)) {
        tag = 'Link';
        append += ` to={routePaths[${q(local)}]}`;
        use('routePaths', 'routing', 'named');
      }
    }
    let attrs = '';
    for (const a of n.attrs || []) {
      if (a.name.startsWith('on')) {
        const code = a.value;
        if (code.startsWith('scrollToInput')) append += ' onClick={sql.scrollToInput}';
        else if (code.startsWith('checkLogin')) append += ' onClick={sql.checkLogin}';
        else if (code.startsWith('viewVulnerabilities'))
          append += ` onClick={()=>setCourse(${q(code.match(/'([^']+)'/)[1])})}`;
        else if (code.startsWith('completeLab'))
          append += ` onClick={()=>setProgress(value=>value.map((item,index)=>index===${Number(code.match(/\((\d)/)[1]) - 1}?Math.min(100,item+25):item))} `;
        else if (code.startsWith('greet'))
          append +=
            page.path === 'dom.html'
              ? ` onClick={()=>window.eval('alert("Hello, '+name+'!")')}`
              : ` onClick={()=>setGreeting('Hello, '+name+'!')}`;
        else throw new Error('Unconverted event in ' + page.path + ': ' + code);
        continue;
      }
      const name =
        props[a.name] ||
        (n.namespaceURI?.includes('svg') && !/^(data|aria)-/.test(a.name)
          ? a.name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
          : a.name);
      if (name in overrides || (name === 'value' && 'value' in overrides)) continue;
      if (tag === 'Link' && name === 'href') continue;
      if (name === 'style') attrs += ` style={${q(styles(a.value))}}`;
      else if (a.name === 'selected') continue;
      else if (a.name === 'checked') attrs += ' defaultChecked';
      else if (a.name === 'value' && ['input', 'textarea', 'select'].includes(tag))
        attrs += ` defaultValue={${q(a.value)}}`;
      else if (bools.has(a.name)) attrs += ` ${name}`;
      else if (['src', 'action', 'href'].includes(a.name) && url(a.value))
        attrs += ` ${name}={assetUrl(${q(url(a.value))})}`;
      else attrs += ` ${name}={${q(a.value)}}`;
    }
    if (id === 'acceptDisclaimer') append += ' onClick={()=>setDisclaimerVisible(false)}';
    for (const [key, value] of Object.entries(overrides)) attrs += ` ${key}={${value}}`;
    if (n.tagName === 'textarea' && !('value' in overrides))
      attrs += ` defaultValue={${q(text(n))}}`;
    const isRawGreeting = id === 'greeting' && page.path === 'uploads/index.html';
    let result =
      voids.has(tag) || tag === 'textarea' || isRawGreeting
        ? `<${tag}${attrs}${append} />`
        : `<${tag}${attrs}${append}>\n${content ?? childMarkup(n)}\n</${tag}>`;
    if (id === 'disclaimer') result = `{disclaimerVisible && (${result})}`;
    return result;
  }
  let markup;
  if (tutorial) {
    use('SqlTutorial', 'components/SqlTutorial');
    markup = '<SqlTutorial />';
  } else markup = childMarkup(body);
  const filename = path.join('src/pages', page.path.replace(/\.html$/, '.jsx'));
  fs.writeFileSync(
    filename,
    `import React, {useState} from 'react';\n${[...imports.values()].join('\n')}\n\nexport default function Page() {\n${declarations.map((line) => '  ' + line).join('\n')}\n  return (<>\n${markup}\n</>);\n}\n`
  );
}
// Remove only the superseded adapters, never the original website.
const pageRoot = path.resolve('src/pages');
function removeAdapters(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.resolve(directory, entry.name);
    if (!file.startsWith(pageRoot + path.sep)) throw new Error('Unexpected adapter path');
    if (entry.isDirectory()) removeAdapters(file);
    else if (entry.name.endsWith('.behavior.js')) fs.unlinkSync(file);
  }
}
removeAdapters(pageRoot);
fs.writeFileSync(
  'src/registry.js',
  pages
    .map((p, i) => `import Page${i} from './pages/${p.path.replace(/\.html$/, '.jsx')}';`)
    .join('\n') +
    '\nexport default {\n' +
    pages.map((p, i) => `${q(p.path)}: Page${i}`).join(',\n') +
    '\n};\n'
);
console.log(
  'Rewrote ' +
    pages.length +
    ' pages with React state and event handlers. Removed legacy behavior adapters.'
);
