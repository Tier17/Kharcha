import { Directory, File, Paths } from 'expo-file-system';

// Only file names are stored in the DB; the app's document path can change between installs.

function dir(name: 'audio' | 'images'): Directory {
  const d = new Directory(Paths.document, name);
  if (!d.exists) d.create({ intermediates: true });
  return d;
}

