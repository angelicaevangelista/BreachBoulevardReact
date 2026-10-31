import { useEffect, useRef, useState } from 'react';
export default function useProfile(initial, restrictExtensions) {
  const [profile, setProfile] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [editing, setEditing] = useState(false);
  const reader = useRef(null);
  useEffect(() => () => reader.current?.abort(), []);
  const edit = () => {
    setDraft(profile);
    setEditing(true);
  };
  const field = (name) => ({
    value: draft[name],
    onChange: (event) => setDraft((value) => ({ ...value, [name]: event.target.value })),
  });
  const [file, setFile] = useState(null);
  async function save(event) {
    event.preventDefault();
    setProfile(draft);
    setEditing(false);
    if (!file) return;
    if (
      restrictExtensions &&
      !['png', 'jpg', 'jpeg'].includes(file.name.split('.').pop().toLowerCase())
    ) {
      window.alert(`Unsupported file type: ${file.name}`);
      return;
    }
    reader.current?.abort();
    const nextReader = new FileReader();
    reader.current = nextReader;
    nextReader.onload = () => setProfile((value) => ({ ...value, avatar: nextReader.result }));
    nextReader.readAsDataURL(file);
  }
  return { profile, draft, editing, edit, field, save, setFile };
}
