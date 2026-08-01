import { localParse } from '@/lib/ai/localParse';
import { AiError, parseExpenses, transcribe } from '@/lib/ai/openai';
import * as repo from '@/lib/db/repo';
import { audioFile } from '@/lib/files';
import { formatMinor, isoDate, toMinor } from '@/lib/format';
import { getApiKey } from '@/lib/settings';
import { recordUsage } from '@/lib/usage';
import { useStore } from '@/store';

