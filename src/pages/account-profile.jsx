import React, { useRef, useState } from 'react';
import AppShell, { Icon, LoadingScreen } from '../components/Interface';
import { useLearner } from '../components/LearnerGate';
import ProfileAvatar from '../components/ProfileAvatar';
import { profileAvatars, profileAvatar, defaultProfileAvatar } from '../data/avatars';

export default function AccountProfile() {
  const learner = useLearner();
  return learner?.user ? (
    <ProfileEditor learner={learner} />
  ) : (
    <LoadingScreen label="Finding your profile…" />
  );
}
function ProfileEditor({ learner }) {
  const [saved, setSaved] = useState(() => ({
    name: learner.user.name || '',
    organization: learner.user.organization || '',
    avatarId: profileAvatar(learner.user.avatarId).id,
  }));
  const [form, setForm] = useState(saved),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(null);
  const pending = useRef(false),
    dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setNotice(null);
  };
  async function submit(event) {
    event.preventDefault();
    if (pending.current || !dirty) return;
    pending.current = true;
    setBusy(true);
    setNotice(null);
    try {
      const user = await learner.updateProfile(form);
      const next = { name: user.name, organization: user.organization, avatarId: user.avatarId };
      setSaved(next);
      setForm(next);
      setNotice({ success: true, text: 'Saved! Your little corner is all updated.' });
    } catch (error) {
      setNotice({ success: false, text: error.message });
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <AppShell
      active="profile"
      title="My profile"
      eyebrow="A little space that feels like you"
      showSidebarBuddy={false}
    >
      <div className="bb-page-heading">
        <div>
          <span className="bb-eyebrow">
            <Icon name="user" size={16} /> YOUR LITTLE CORNER
          </span>
          <h1>
            Make yourself at home<span className="bb-orange">.</span>
          </h1>
          <p>A familiar face, a name you love, and a little about your world.</p>
        </div>
      </div>
      <div className="bb-profile-layout">
        <aside className="bb-profile-preview" aria-label="Profile preview">
          <span className="bb-profile-preview-label">A LITTLE HELLO FROM</span>
          <div className="bb-profile-portrait">
            <ProfileAvatar id={form.avatarId} size={144} />
            <span aria-hidden="true">✦</span>
          </div>
          <h2>{form.name.trim() || 'Curious human'}</h2>
          <p>{form.organization.trim() || 'Finding my way on the Boulevard'}</p>
          <span className="bb-profile-preview-badge">
            <Icon name="heart" size={15} /> Curiosity looks good on you
          </span>
          <small>Preview · Your changes appear here as you edit.</small>
        </aside>
        <form className="bb-profile-form" onSubmit={submit}>
          <section className="bb-profile-section">
            <div className="bb-profile-section-heading">
              <span>01</span>
              <div>
                <h2>The little details</h2>
                <p>How would you like us to greet you?</p>
              </div>
            </div>
            <div className="bb-form">
              <label htmlFor="profile-name">Display name</label>
              <input
                id="profile-name"
                name="name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                maxLength={60}
                required
                autoComplete="nickname"
                disabled={busy}
              />
              <label htmlFor="profile-organization">
                School or company <span className="bb-profile-optional">Optional</span>
              </label>
              <input
                id="profile-organization"
                name="organization"
                value={form.organization}
                onChange={(e) => set('organization', e.target.value)}
                maxLength={120}
                autoComplete="organization"
                placeholder="Your school, campus, company, or team"
                disabled={busy}
                aria-describedby="profile-organization-note"
              />
              <small id="profile-organization-note">
                Your school/company is only shown in your own account.
              </small>
              <div className="bb-profile-email">
                <Icon name="mail" size={18} />
                <div>
                  <strong>Sign-in email</strong>
                  <span>{learner.user.email}</span>
                </div>
                <Icon name="lock" size={17} />
              </div>
            </div>
          </section>
          <section className="bb-profile-section">
            <div className="bb-profile-section-heading">
              <span>02</span>
              <div>
                <h2>Pick your little companion</h2>
                <p>15 little bees, each with their own personality. Or keep a simple honeycomb.</p>
              </div>
            </div>
            <fieldset className="bb-avatar-picker" disabled={busy}>
              <legend className="sr-only">Choose your avatar</legend>
              {[defaultProfileAvatar, ...profileAvatars].map((avatar) => (
                <label
                  className={`bb-avatar-option ${avatar.id === defaultProfileAvatar.id ? 'bb-avatar-default' : ''} ${form.avatarId === avatar.id ? 'is-selected' : ''}`}
                  key={avatar.id}
                >
                  <input
                    type="radio"
                    name="avatarId"
                    value={avatar.id}
                    checked={form.avatarId === avatar.id}
                    onChange={() => set('avatarId', avatar.id)}
                  />
                  <span className="bb-avatar-option-art">
                    <ProfileAvatar id={avatar.id} size={68} decorative />
                    {form.avatarId === avatar.id && (
                      <span className="bb-avatar-check" aria-hidden="true">
                        <Icon name="check" size={13} />
                      </span>
                    )}
                  </span>
                  <span>
                    {avatar.name}
                    {avatar.id === defaultProfileAvatar.id && (
                      <small>Default · Keep it simple</small>
                    )}
                  </span>
                </label>
              ))}
            </fieldset>
            <p className="bb-profile-avatar-note">
              <Icon name="spark" size={15} />
              {profileAvatar(form.avatarId).description}
            </p>
          </section>
          <div className="bb-profile-save">
            <span>
              {busy
                ? 'Saving your little corner…'
                : dirty
                  ? 'You have unsaved changes.'
                  : 'Your profile is up to date.'}
            </span>
            <div>
              <button
                className="bb-button bb-button-quiet"
                type="button"
                disabled={busy || !dirty}
                onClick={() => {
                  setForm(saved);
                  setNotice(null);
                }}
              >
                Reset changes
              </button>
              <button
                type="submit"
                className="bb-button bb-button-primary"
                disabled={busy || !dirty}
              >
                {busy ? 'Saving…' : 'Save profile'}
                <Icon name="check" size={17} />
              </button>
            </div>
          </div>
          {notice && (
            <p
              className={`bb-profile-notice ${notice.success ? 'is-success' : 'is-error'}`}
              role={notice.success ? 'status' : 'alert'}
            >
              {notice.text}
            </p>
          )}
        </form>
      </div>
    </AppShell>
  );
}
