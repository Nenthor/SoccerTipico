import { writeFileSync } from 'fs';
import settings_json from './data/settings.json' assert { type: 'json' };
import config from '$lib/server/data/config.json' assert { type: 'json' };

export const settings = {
	public: settings_json.public
};

export function setStatus(status: boolean) {
	settings.public = status;
	writeFileSync(`${config.path}/src/lib/server/data/settings.json`, JSON.stringify(settings));
}
