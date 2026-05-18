import { Directory, File, Paths } from 'expo-file-system';

// Only file names are stored in the DB; the app's document path can change between installs.

function dir(name: 'audio' | 'images'): Directory {
  const d = new Directory(Paths.document, name);
  if (!d.exists) d.create({ intermediates: true });
  return d;
}

export function audioFile(fileName: string): File {
  return new File(dir('audio'), fileName);
}

/** Moves a fresh recording from the recorder's temp location into permanent storage. */
export function keepRecording(tempUri: string, id: string): string {
  const ext = tempUri.split('.').pop() || 'm4a';
  const fileName = `${id}.${ext}`;
  new File(tempUri).moveSync(audioFile(fileName));
  return fileName;
}

