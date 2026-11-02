import React, { useState } from 'react';
import { Icon } from '../Interface';
function MiniChart() {
  return (
    <div className="target-chart" aria-label="Illustrative activity chart">
      {[32, 50, 44, 76, 59, 91, 72, 100, 81, 106, 96, 122].map((height, i) => (
        <i key={i} style={{ height }} />
      ))}
    </div>
  );
}
export default function TargetWebsite({ lab, values, setValues, onSubmit, busy, result }) {
  const { platform } = lab;
  const [muted, setMuted] = useState(true),
    [camera, setCamera] = useState(false),
    [playing, setPlaying] = useState(false),
    [tab, setTab] = useState('Overview');
  const set = (key, value) => setValues((previous) => ({ ...previous, [key]: value }));
  const fields = (keys) => (
    <div className="target-fields">
      {lab.fields
        .filter((field) => keys.includes(field.key))
        .map((field) => (
          <label key={field.key} htmlFor={'site-' + field.key}>
            <span>{field.label}</span>
            {field.type === 'textarea' ? (
              <textarea
                id={'site-' + field.key}
                rows={3}
                value={values[field.key]}
                onChange={(e) => set(field.key, e.target.value)}
                maxLength={4096}
              />
            ) : (
              <input
                id={'site-' + field.key}
                type={field.type || 'text'}
                autoComplete="off"
                maxLength={4096}
                value={values[field.key]}
                onChange={(e) => set(field.key, e.target.value)}
              />
            )}
          </label>
        ))}
    </div>
  );
  const action = (label) => (
    <button type="submit" className="target-primary" disabled={busy}>
      {busy ? 'Working…' : label}
      <Icon name="arrow" size={15} />
    </button>
  );
  const nav = (items) => (
    <nav className="target-subnav" aria-label={platform.name + ' sections'}>
      {items.map((item) => (
        <button
          type="button"
          key={item}
          onClick={() => setTab(item)}
          className={tab === item ? 'is-active' : ''}
        >
          {item}
        </button>
      ))}
    </nav>
  );
  const avatar = (name, color = '') => (
    <span className={'target-avatar ' + color}>{name.slice(0, 1)}</span>
  );
  const output = result?.output;
  const notice =
    output &&
    (output.post?.body ||
      output.greenRoom ||
      output.receipt ||
      output.transfer ||
      output.content ||
      output.message ||
      output.note ||
      output.notice ||
      output.trace ||
      output.help);
  let scene;
  switch (platform.kind) {
    case 'login':
      scene = (
        <div className="target-login-layout">
          <div>
            <span className="target-kicker">GATEHOUSE FOR TEAMS</span>
            <h2>
              Good work starts
              <br />
              with a secure hello.
            </h2>
            <p>One place for your team, projects, and the little things that keep work moving.</p>
            <div className="target-mini-dashboard">
              <span>WORKSPACE ACTIVITY</span>
              <MiniChart />
              <div>
                <span>
                  Projects <strong>12</strong>
                </span>
                <span>
                  Teammates <strong>24</strong>
                </span>
              </div>
            </div>
          </div>
          <section className="target-card">
            <span className="target-icon">
              <Icon name="lock" />
            </span>
            <h3>Welcome to your workspace</h3>
            <p>Sign in to continue to the team dashboard.</p>
            {fields(['username', 'password'])}
            {action('Sign in')}
            <small>Fictional training account · Organization SSO</small>
          </section>
        </div>
      );
      break;
    case 'social':
      scene = (
        <div className="target-social-layout">
          <aside>
            {nav(['Overview', 'Following', 'Bookmarks'])}
            <div className="target-card">
              <span className="target-kicker">YOUR CORNER</span>
              <h3>Room for good conversations.</h3>
              <p>Share a thought. Find your people.</p>
            </div>
          </aside>
          <div className="target-social-feed">
            <div className="target-card target-post">
              <div className="target-person">
                {avatar('Mira')}
                <div>
                  <strong>Mira Chen</strong>
                  <small>Community team · 2h</small>
                </div>
                <Icon name="spark" size={17} />
              </div>
              <p>
                What’s one little thing you learned today? I finally figured out why my browser
                remembers every tab.
              </p>
              <div className="target-post-art">
                <span>
                  STAY A LITTLE
                  <br />
                  <b>CURIOUS.</b>
                </span>
                <i />
                <i />
                <i />
              </div>
              <div className="target-post-counts">
                <span>♡ 24</span>
                <span>☏ 8 replies</span>
                <span>↗ Share</span>
              </div>
            </div>
            <section className="target-card">
              <h3>{lab.id === 'ctf-social-draft' ? 'Open a post' : 'Join the conversation'}</h3>
              {fields(['postId', 'payload'])}
              {action(lab.id === 'ctf-social-draft' ? 'Open post' : 'Post comment')}
            </section>
          </div>
          <aside className="target-card">
            <h3>Around the block</h3>
            {['Design discoveries', 'Weekend projects', 'A small win'].map((item, i) => (
              <p key={item}>
                <span className="target-rank">0{i + 1}</span>
                {item}
              </p>
            ))}
            <small>Your profile is public. Drafts should be private.</small>
          </aside>
        </div>
      );
      break;
    case 'meeting':
      scene = (
        <>
          <div className="target-meeting-title">
            <div>
              <span className="target-kicker">{platform.name} / MEET</span>
              <h2>{lab.id === 'authentication' ? 'Your team is waiting.' : 'Design rehearsal'}</h2>
              <p>Check your setup, then join the conversation.</p>
            </div>
            <span className="target-chip">End-to-end rehearsal</span>
          </div>
          <div className="target-meeting-layout">
            <div className="target-video-grid">
              {['You', 'Mira', 'Theo', 'Sam'].map((name, i) => (
                <div className={'target-video-tile target-tile-' + i} key={name}>
                  {avatar(name)}
                  <strong>
                    {name}
                    {i === 0 && !camera ? ' · Camera off' : ''}
                  </strong>
                  <span>{i === 0 ? (muted ? 'Mic muted' : 'Mic on') : 'Waiting in lobby'}</span>
                </div>
              ))}
            </div>
            <section className="target-card">
              <h3>{lab.id === 'authentication' ? 'Join your workspace' : 'Ready to join?'}</h3>
              <p>
                {lab.id === 'authentication'
                  ? 'Your fictional trainee account is provisioned.'
                  : 'Design team · meeting BLVD101'}
              </p>
              {fields(['username', 'password', 'roomId'])}
              {action(lab.id === 'authentication' ? 'Join workspace' : 'Join meeting')}
              <small>Guest role is sent in the lobby request.</small>
            </section>
          </div>
          <div className="target-meeting-controls">
            <button type="button" onClick={() => setMuted((v) => !v)}>
              <Icon name={muted ? 'mute' : 'volume'} size={18} />
              {muted ? 'Unmute' : 'Mute'}
            </button>
            <button type="button" onClick={() => setCamera((v) => !v)}>
              <Icon name="eye" size={18} />
              {camera ? 'Camera off' : 'Camera on'}
            </button>
            <span>4 participants · All cameras and audio are simulated.</span>
          </div>
        </>
      );
      break;
    case 'invoice':
      scene = (
        <>
          {nav(['Overview', 'Invoices', 'Clients', 'Reports'])}
          <div className="target-section-heading">
            <div>
              <span className="target-kicker">BILLING WORKSPACE</span>
              <h2>A clearer view of your invoices.</h2>
            </div>
            <span className="target-chip">Trainee account</span>
          </div>
          <div className="target-metrics">
            <div>
              <small>Outstanding</small>
              <strong>49.00</strong>
            </div>
            <div>
              <small>Paid this month</small>
              <strong>640.00</strong>
            </div>
            <div>
              <small>Open invoices</small>
              <strong>1</strong>
            </div>
          </div>
          <div className="target-two-col">
            <section className="target-card">
              <h3>Recent invoices</h3>
              <div className="target-data-row">
                <span>#101</span>
                <span>Web security workshop</span>
                <b>49.00</b>
              </div>
              <div className="target-data-row">
                <span>Client</span>
                <span>Trainee account</span>
                <span className="target-chip">Pending</span>
              </div>
              <small>Object IDs are included in the invoice request.</small>
            </section>
            <section className="target-card">
              <h3>Invoice viewer</h3>
              {fields(['invoiceId'])}
              {action('View invoice')}
            </section>
          </div>
        </>
      );
      break;
    case 'files':
      scene = (
        <>
          {nav(['Overview', 'Shared files', 'Recent', 'Trash'])}
          <div className="target-section-heading">
            <div>
              <span className="target-kicker">SHARED WORKSPACE</span>
              <h2>A little less file chaos.</h2>
              <p>Team drive / public</p>
            </div>
            <span className="target-chip">2 files</span>
          </div>
          <div className="target-file-layout">
            <aside className="target-card">
              <h3>Folders</h3>
              {['Team drive', 'Public', 'Archive', 'Favorites'].map((folder) => (
                <button
                  type="button"
                  key={folder}
                  onClick={() => setTab(folder)}
                  className={tab === folder ? 'is-active' : ''}
                >
                  <Icon name="book" size={15} />
                  {folder}
                </button>
              ))}
              <div className="target-storage-bar">
                <i />
              </div>
              <small>2.4 GB of 10 GB used</small>
            </aside>
            <section className="target-card">
              <div className="target-file-row">
                <Icon name="book" />
                <span>
                  <b>welcome.txt</b>
                  <small>Text document · shared with you</small>
                </span>
                <button type="button" onClick={() => set('filename', 'welcome.txt')}>
                  Select
                </button>
              </div>
              <div className="target-file-row">
                <Icon name="eye" />
                <span>
                  <b>team-photo.png</b>
                  <small>Image · shared with you</small>
                </span>
                <button type="button" onClick={() => set('filename', 'team-photo.png')}>
                  Select
                </button>
              </div>
              <h3>Download a file</h3>
              {fields(['filename'])}
              {action('Open file')}
            </section>
          </div>
        </>
      );
      break;
    case 'fitness':
      scene = (
        <>
          {nav(['Overview', 'Activity', 'Goals', 'Profile'])}
          <div className="target-section-heading">
            <div className="target-person">
              {avatar('Avery')}
              <div>
                <span className="target-kicker">GOOD TO SEE YOU, AVERY</span>
                <h2>One small step at a time.</h2>
              </div>
            </div>
            <span className="target-chip">Your training profile</span>
          </div>
          <div className="target-metrics">
            <div>
              <small>Weekly activity</small>
              <strong>4 days</strong>
            </div>
            <div>
              <small>Daily steps</small>
              <strong>6,240</strong>
            </div>
            <div>
              <small>Active minutes</small>
              <strong>32</strong>
            </div>
          </div>
          <div className="target-two-col">
            <section className="target-card">
              <h3>Your week in motion</h3>
              <MiniChart />
              <small>Illustrative activity, using fictional data.</small>
            </section>
            <section className="target-card">
              <h3>Profile settings</h3>
              <p>Avery · Neighborhood walking club</p>
              {fields(['endpoint'])}
              {action('Refresh profile')}
            </section>
          </div>
        </>
      );
      break;
    case 'shop':
      scene = (
        <>
          {nav(['Overview', 'New arrivals', 'Your cart', 'Orders'])}
          <div className="target-shop-banner">
            <span className="target-kicker">GOOD FINDS. LITTLE PRICES.</span>
            <h2>
              A little upgrade.
              <br />A lot more possibility.
            </h2>
          </div>
          <div className="target-two-col">
            <section className="target-card target-product">
              <div className="target-product-art">
                <Icon name="shield" size={76} />
                <span>
                  STARTER
                  <br />
                  <b>KIT.</b>
                </span>
              </div>
              <div>
                <span className="target-kicker">THE EVERYDAY COLLECTION</span>
                <h3>Security starter kit</h3>
                <p>A notebook, a desk mat, and a place for your next great idea.</p>
                <strong>49 credits</strong>
              </div>
            </section>
            <section className="target-card">
              <h3>Your cart</h3>
              <div className="target-data-row">
                <span>Starter kit</span>
                <strong>49 credits</strong>
              </div>
              {fields(['quantity'])}
              <div className="target-data-row">
                <span>Delivery</span>
                <span>Free</span>
              </div>
              {action('Checkout')}
              <small>Product and price are included in the checkout request.</small>
            </section>
          </div>
        </>
      );
      break;
    case 'blog':
      scene = (
        <div className="target-article-layout">
          <article>
            <span className="target-kicker">THE SLOW INTERNET / ISSUE 08</span>
            <h2>Good ideas need a little room to grow.</h2>
            <div className="target-person">
              {avatar('Jules')}
              <div>
                <strong>Jules Harper</strong>
                <small>5 min read · Neighborhood notes</small>
              </div>
            </div>
            <div className="target-article-art">
              <i />
              <i />
              <span>
                MAKE
                <br />A LITTLE
                <br />
                <b>SPACE.</b>
              </span>
            </div>
            <p>
              There is something quietly wonderful about learning a thing for the first time. You
              stop, follow a thread, and suddenly the world makes a little more sense.
            </p>
            <p>What did you discover this week?</p>
          </article>
          <section className="target-card">
            <span className="target-chip">Reader conversation</span>
            <h3>Leave a little thought.</h3>
            {fields(['content'])}
            {action('Preview comment')}
            <small>Comments appear in the editorial preview before publication.</small>
          </section>
        </div>
      );
      break;
    case 'support':
      scene = (
        <>
          {nav(['Overview', 'My tickets', 'Knowledge base', 'Team'])}
          <div className="target-section-heading">
            <div>
              <span className="target-kicker">CUSTOMER WORKSPACE</span>
              <h2>Let’s get this sorted.</h2>
              <p>Your conversations with the support crew.</p>
            </div>
            <span className="target-chip">2 open tickets</span>
          </div>
          <div className="target-two-col">
            <section className="target-card">
              <h3>Latest conversations</h3>
              {[
                ['#701', 'Can’t access the launch workspace', 'Waiting on operations'],
                ['#698', 'A little question about billing', 'Resolved'],
                ['#694', 'Changing my display name', 'Resolved'],
              ].map(([id, title, status]) => (
                <div className="target-ticket" key={id}>
                  <span>{id}</span>
                  <div>
                    <b>{title}</b>
                    <small>{status}</small>
                  </div>
                  <Icon name="chevron" size={16} />
                </div>
              ))}
            </section>
            <section className="target-card">
              <h3>Ticket details</h3>
              {fields(['ticketId'])}
              {action('Open conversation')}
              <small>Internal notes should only be visible to the assigned support team.</small>
            </section>
          </div>
        </>
      );
      break;
    case 'video':
      scene = (
        <>
          {nav(['Overview', 'Subscriptions', 'Watch later', 'Studio'])}
          <div className="target-two-col">
            <section>
              <div className={'target-player ' + (playing ? 'is-playing' : '')}>
                <div className="target-player-landscape">
                  <i />
                  <i />
                  <i />
                </div>
                <button
                  type="button"
                  aria-label={playing ? 'Pause video' : 'Play video'}
                  onClick={() => setPlaying((v) => !v)}
                >
                  {playing ? 'Ⅱ' : '▶'}
                </button>
                <span>{playing ? 'Playing a fictional preview' : '00:00 / 04:32'}</span>
              </div>
              <h2>Little moments from the weekend.</h2>
              <div className="target-person">
                {avatar('Avery')}
                <div>
                  <strong>Avery’s corner</strong>
                  <small>12.4k subscribers</small>
                </div>
                <span className="target-chip">Following</span>
              </div>
            </section>
            <section className="target-card">
              <h3>Open a video</h3>
              {fields(['asset'])}
              {action('Load manifest')}
              <div className="target-video-suggestion">
                <Icon name="terminal" size={30} />
                <div>
                  <b>Staff onboarding</b>
                  <small>Unlisted · Team studio</small>
                </div>
              </div>
              <div className="target-video-suggestion">
                <Icon name="heart" size={30} />
                <div>
                  <b>A calmer kind of morning</b>
                  <small>04:12 · Recommended</small>
                </div>
              </div>
            </section>
          </div>
        </>
      );
      break;
    case 'travel':
      scene = (
        <>
          {nav(['Overview', 'Explore', 'Saved trips', 'Bookings'])}
          <div className="target-travel-hero">
            <span className="target-kicker">A LITTLE FURTHER FROM ORDINARY</span>
            <h2>
              A change of scenery
              <br />
              looks good on you.
            </h2>
            <p>Slow mornings. New streets. A story worth bringing home.</p>
          </div>
          <div className="target-two-col">
            <section className="target-card target-trip">
              <div className="target-trip-art">
                <i />
                <i />
                <span>
                  THE CITY
                  <br />
                  <b>ESCAPE</b>
                </span>
              </div>
              <h3>Two nights, endless little discoveries.</h3>
              <p>Neighborhood stay · Breakfast included · Flexible check-in</p>
              <span className="target-chip">100 credits</span>
            </section>
            <section className="target-card">
              <h3>Make it a little getaway.</h3>
              {fields(['coupons'])}
              <p>Welcome offer: 40 credits off your first stay.</p>
              {action('Confirm booking')}
            </section>
          </div>
        </>
      );
      break;
    case 'recruit':
      scene = (
        <>
          {nav(['Overview', 'Find work', 'Applications', 'Profile'])}
          <div className="target-section-heading">
            <div>
              <span className="target-kicker">SMALL TEAM. MEANINGFUL WORK.</span>
              <h2>Your next chapter starts here.</h2>
              <p>Product Security Intern · Remote-friendly · Learning budget</p>
            </div>
            <span className="target-chip">Applications open</span>
          </div>
          <div className="target-two-col">
            <section className="target-card">
              <h3>Make the internet a little kinder.</h3>
              <p>
                Join a team that cares about thoughtful products and the people using them. Bring
                your curiosity; we’ll help you build the skills.
              </p>
              <h4>What you’ll explore</h4>
              <p>Web security reviews, input handling, and secure product design.</p>
              <div className="target-person">
                {avatar('Taylor')}
                <div>
                  <strong>Taylor</strong>
                  <small>Your recruiting contact</small>
                </div>
              </div>
            </section>
            <section className="target-card">
              <h3>A little introduction.</h3>
              <div className="target-upload">
                <Icon name="book" size={34} />
                <b>Your fictional resume</b>
                <small>Edit simulated file metadata; no personal file is uploaded.</small>
              </div>
              {fields(['filename', 'content'])}
              {action('Preview application')}
            </section>
          </div>
        </>
      );
      break;
    case 'bank':
      scene = (
        <>
          {nav(['Overview', 'Payments', 'Cards', 'Activity'])}
          <div className="target-section-heading">
            <div>
              <span className="target-kicker">YOUR DEMO ACCOUNT</span>
              <h2>A clearer view of your credits.</h2>
            </div>
            <span className="target-chip">Fictional balances</span>
          </div>
          <div className="target-two-col">
            <section>
              <div className="target-bank-card">
                <Icon name="shield" size={25} />
                <span>Available balance</span>
                <strong>
                  420.00 <small>credits</small>
                </strong>
                <div>
                  •••• 2048 <b>POCKETPIER</b>
                </div>
              </div>
              <div className="target-card">
                <h3>Recent activity</h3>
                <div className="target-data-row">
                  <span>Neighborhood cafe</span>
                  <b>−4.50</b>
                </div>
                <div className="target-data-row">
                  <span>Workshop refund</span>
                  <b>+25.00</b>
                </div>
              </div>
            </section>
            <section className="target-card">
              <h3>Send a little something.</h3>
              <p>To: Workshop Collective · Demo recipient</p>
              {fields(['amount'])}
              {action('Send credits')}
              <small>
                Review the Origin, content type, and CSRF fields in the request inspector.
              </small>
            </section>
          </div>
        </>
      );
      break;
    case 'devops':
      scene = (
        <>
          {nav(['Overview', 'Builds', 'Artifacts', 'Settings'])}
          <div className="target-section-heading">
            <div>
              <span className="target-kicker">BOULEVARD / WEB-APP</span>
              <h2>A healthier pipeline starts here.</h2>
            </div>
            <span className="target-chip">main · 811</span>
          </div>
          <div className="target-pipeline">
            {['Checkout', 'Install', 'Test', 'Build', 'Publish'].map((label) => (
              <span key={label}>
                <Icon name="check" size={16} />
                {label}
              </span>
            ))}
          </div>
          <div className="target-two-col">
            <section className="target-card">
              <h3>Build log</h3>
              <pre className="target-terminal">
                {
                  '> checkout main\n✓ dependencies cached\n✓ 122 checks passed\n✓ artifact readme.txt published\n\nDebug trace available on request.'
                }
              </pre>
            </section>
            <section className="target-card">
              <h3>{values.stage === 'exploit' ? 'Artifact browser' : 'Inspect a build'}</h3>
              {fields(values.stage === 'exploit' ? ['artifact'] : ['buildId'])}
              {action(values.stage === 'exploit' ? 'Download artifact' : 'Read build log')}
            </section>
          </div>
        </>
      );
      break;
    case 'health':
      scene = (
        <>
          {nav(['Overview', 'Directory', 'Appointments', 'Records'])}
          <div className="target-section-heading">
            <div>
              <span className="target-kicker">EAST CLINIC / TRAINING WORKSPACE</span>
              <h2>Thoughtful care, clearly connected.</h2>
            </div>
            <span className="target-chip">Synthetic records only</span>
          </div>
          <div className="target-two-col">
            <section className="target-card">
              <h3>Today’s appointments</h3>
              {[
                ['09:00', 'Record R-101', 'Routine training appointment'],
                ['10:30', 'Record R-108', 'Demo follow-up'],
                ['14:00', 'Directory sync', 'West clinic partner'],
              ].map(([time, name, note]) => (
                <div className="target-ticket" key={time}>
                  <span>{time}</span>
                  <div>
                    <b>{name}</b>
                    <small>{note}</small>
                  </div>
                </div>
              ))}
              <p>The directory and clinical records share a batched GraphQL gateway.</p>
            </section>
            <section className="target-card">
              <h3>Record lookup</h3>
              {fields(['patientId', 'organization'])}
              {action(values.stage === 'exploit' ? 'Run record query' : 'Inspect directory')}
              <small>No real patient information is stored or displayed.</small>
            </section>
          </div>
        </>
      );
      break;
    case 'design':
      scene = (
        <>
          {nav(['Overview', 'Editor', 'Assets', 'Exports'])}
          <div className="target-design-toolbar">
            <span>
              <Icon name="code" size={17} />
              Untitled project
            </span>
            <div>
              {['Select', 'Text', 'Shape'].map((tool) => (
                <button
                  type="button"
                  key={tool}
                  onClick={() => setTab(tool)}
                  className={tab === tool ? 'is-active' : ''}
                >
                  {tool}
                </button>
              ))}
            </div>
            <span className="target-chip">Saved locally</span>
          </div>
          <div className="target-two-col">
            <div className="target-artboard">
              <div className="target-design-poster">
                <span>
                  YOUR NEXT
                  <br />
                  LITTLE
                  <br />
                  <b>BIG IDEA.</b>
                </span>
                <i />
                <i />
                <small>PIXELDOCK / STUDIO SERIES</small>
              </div>
              <span className="target-canvas-note">
                {['Select', 'Text', 'Shape'].includes(tab)
                  ? tab + ' tool selected'
                  : 'Canvas · 640 × 480'}
              </span>
            </div>
            <section className="target-card">
              <h3>{values.stage === 'exploit' ? 'Export workspace' : 'Project importer'}</h3>
              {fields(values.stage === 'exploit' ? ['exportPath'] : ['projectJson'])}
              {action(values.stage === 'exploit' ? 'Export design' : 'Import project')}
              <small>
                Imported configuration is simulated; no real object prototype is modified.
              </small>
            </section>
          </div>
        </>
      );
      break;
    case 'learning':
      scene = (
        <>
          {nav(['Overview', 'My courses', 'Community', 'Settings'])}
          <div className="target-two-col">
            <section>
              <div className="target-course-cover">
                <Icon name="book" size={55} />
                <span>
                  WEB SECURITY
                  <br />
                  <b>STUDIO</b>
                </span>
                <small>COHORT 08 · LEARN TOGETHER</small>
              </div>
              <h2>Small lessons. A whole new perspective.</h2>
              <p>
                Six weeks of curious questions, thoughtful practice, and a little more confidence.
              </p>
              <div className="target-person">
                {avatar('Mira')}
                <div>
                  <strong>Mira Chen</strong>
                  <small>Your workshop guide</small>
                </div>
              </div>
            </section>
            <section className="target-card">
              <span className="target-chip">1 seat remaining</span>
              <h3>Make room for your next discovery.</h3>
              <p>Live sessions · Practical projects · A friendly cohort</p>
              <div className="target-data-row">
                <span>Seat snapshot</span>
                <b>Revision R6</b>
              </div>
              {fields(['revision'])}
              {action(values.stage === 'exploit' ? 'Confirm enrollment' : 'Reserve the last seat')}
              <small>Inspect confirmation revisions and dispatch mode after reservation.</small>
            </section>
          </div>
        </>
      );
      break;
    case 'music':
      scene = (
        <>
          {nav(['Overview', 'Sessions', 'Stems', 'Integrations'])}
          <div className="target-section-heading">
            <div>
              <span className="target-kicker">THE NEIGHBORHOOD SESSIONS</span>
              <h2>A little room to make some noise.</h2>
            </div>
            <span className="target-chip">Studio workspace</span>
          </div>
          <div className="target-two-col">
            <section className="target-card">
              <div className="target-record">
                <i />
                <span>ER</span>
              </div>
              <h3>Rain on the boulevard</h3>
              <p>Avery & friends · Unreleased demo</p>
              <div className={'target-waveform ' + (playing ? 'is-playing' : '')}>
                {Array.from({ length: 35 }, (_, i) => (
                  <i
                    key={i}
                    style={{ height: 12 + ((i * 17) % 41), animationDelay: i * 0.035 + 's' }}
                  />
                ))}
              </div>
              <button
                type="button"
                className="target-secondary"
                onClick={() => setPlaying((v) => !v)}
              >
                {playing ? 'Pause demo' : 'Play demo'}
                <Icon name="volume" size={16} />
              </button>
            </section>
            <section className="target-card">
              <h3>Connect your creative tools.</h3>
              <p>Send session updates through a studio connector.</p>
              {fields(['connector', 'hookUrl'])}
              {action(values.stage === 'exploit' ? 'Test destination' : 'Inspect connector')}
              <small>Connector requests are simulated; no external URL is contacted.</small>
            </section>
          </div>
        </>
      );
      break;
    default:
      scene = (
        <section className="target-card">
          <h2>{platform.name}</h2>
          {fields(lab.fields.map((field) => field.key))}
          {action('Continue')}
        </section>
      );
  }
  return (
    <section
      className="target-browser"
      style={{ '--target-accent': platform.accent }}
      aria-label={platform.name + ' simulated website'}
    >
      <div className="target-browser-chrome">
        <span className="bb-code-dots">
          <i />
          <i />
          <i />
        </span>
        <div>
          <Icon name="lock" size={12} />
          {platform.domain}
          {lab.track === 'ctf' ? '/workspace' : '/app'}
        </div>
        <span>SIMULATED WEBSITE</span>
      </div>
      <div className="target-app-header">
        <div className="target-brand">
          <span>
            <Icon name={lab.category === 'SQL Injection' ? 'lock' : 'spark'} size={20} />
          </span>
          <strong>
            {platform.name}
            <i>.</i>
          </strong>
        </div>
        <div className="target-header-links">
          <span>{platform.tagline}</span>
          {avatar('You')}
        </div>
      </div>
      <form onSubmit={onSubmit} className={'target-page target-kind-' + platform.kind}>
        {scene}
      </form>
      {output && (
        <div
          className={'target-notice ' + (output.recoveredFlag ? 'is-discovery' : '')}
          aria-live="polite"
        >
          <Icon name={output.recoveredFlag ? 'flag' : 'terminal'} size={18} />
          <div>
            <strong>
              {output.recoveredFlag
                ? 'A private flag was recovered.'
                : `Response ${output.status || 'received'}`}
            </strong>
            {notice && <p>{notice}</p>}
            {output.recoveredFlag && <code>{output.recoveredFlag}</code>}
            {output.manifest && <pre>{output.manifest}</pre>}
          </div>
        </div>
      )}
      <footer className="target-footer">
        <span>© {platform.name} · Fictional training environment</span>
        <span>Your inputs stay in this simulation.</span>
      </footer>
    </section>
  );
}
