import { writeFileSync } from 'fs';
import settings_json from './data/settings.json' assert { type: 'json' };
import config from '$lib/server/data/config.json' assert { type: 'json' };
import type { Match, Bet, Team } from '$lib/server/database';
import { sendToPanel } from './websocket';
import type { PanelData } from '$lib/Types';

export const settings = {
	public: settings_json.public,
	panel1: settings_json.panel1,
	panel2: settings_json.panel2
};

export function setStatus(status: boolean) {
	settings.public = status;
	updateFile();
}

export function updatePanelTeams(teams: Team[]) {
	if (!teams) return;
	const teams_str = JSON.stringify(teams);
	settings.panel1.teams = teams_str;
	settings.panel2.teams = teams_str;

	sendToPanel('1', `update==${getJSONPanelData('1')}`);
	sendToPanel('2', `update==${getJSONPanelData('2')}`);
	updateFile();
}

export function updatePanelMatch(panel_id: string, match: Match | null) {
	if (!match) {
		if (panel_id == '1') settings.panel1.match = '';
		else if (panel_id == '2') settings.panel2.match = '';
		updateFile();
		return;
	}
	if (panel_id == '1') settings.panel1.match = JSON.stringify(match);
	else if (panel_id == '2') settings.panel2.match = JSON.stringify(match);

	sendToPanel(panel_id, `update==${getJSONPanelData(panel_id)}`);
	updateFile();
}

export function updatePanelBet(panel_id: string, bet: Bet | null) {
	if (!bet) {
		if (panel_id == '1') settings.panel1.bet = '';
		else if (panel_id == '2') settings.panel2.bet = '';
		updateFile();
		return;
	}
	if (panel_id == '1') settings.panel1.bet = JSON.stringify(bet);
	else if (panel_id == '2') settings.panel2.bet = JSON.stringify(bet);

	sendToPanel(panel_id, `update==${getJSONPanelData(panel_id)}`);
	updateFile();
}

function getJSONPanelData(panel_id: string) {
	if (panel_id == '1') return JSON.stringify(settings.panel1);
	else if (panel_id == '2') return JSON.stringify(settings.panel2);
	else return '';
}

export function getPanelData(panel_id: string) {
	let data: PanelData;
	if (panel_id == '1') {
		data = {
			bet: settings.panel1.bet ? JSON.parse(settings.panel1.bet) : null,
			match: settings.panel1.match ? JSON.parse(settings.panel1.match) : null,
			teams: settings.panel1.teams ? JSON.parse(settings.panel1.teams) : null
		};
	} else if (panel_id == '2') {
		data = {
			bet: settings.panel2.bet ? JSON.parse(settings.panel2.bet) : null,
			match: settings.panel2.match ? JSON.parse(settings.panel2.match) : null,
			teams: settings.panel2.teams ? JSON.parse(settings.panel2.teams) : null
		};
	} else return null;
	return data;
}

function updateFile() {
	writeFileSync(`${config.path}/src/lib/server/data/settings.json`, JSON.stringify(settings, null, 2));
}
