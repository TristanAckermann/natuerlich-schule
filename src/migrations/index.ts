import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260823_123349_startseite from './20260823_123349_startseite';
import * as migration_20260823_160511_stundenplan from './20260823_160511_stundenplan';
import * as migration_20260823_163433_seitenkopf from './20260823_163433_seitenkopf';
import * as migration_20260823_165157_events from './20260823_165157_events';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260823_123349_startseite.up,
    down: migration_20260823_123349_startseite.down,
    name: '20260823_123349_startseite',
  },
  {
    up: migration_20260823_160511_stundenplan.up,
    down: migration_20260823_160511_stundenplan.down,
    name: '20260823_160511_stundenplan',
  },
  {
    up: migration_20260823_163433_seitenkopf.up,
    down: migration_20260823_163433_seitenkopf.down,
    name: '20260823_163433_seitenkopf',
  },
  {
    up: migration_20260823_165157_events.up,
    down: migration_20260823_165157_events.down,
    name: '20260823_165157_events'
  },
];
