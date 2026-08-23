import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260823_123349_startseite from './20260823_123349_startseite';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260823_123349_startseite.up,
    down: migration_20260823_123349_startseite.down,
    name: '20260823_123349_startseite'
  },
];
