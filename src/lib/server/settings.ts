import { writeFile } from 'fs';
import settings_json from './data/settings.json' assert { type: 'json' };
import config from '$lib/server/data/config.json' assert { type: 'json' };
import { sendToPanel } from './websocket';
import type { Match, Team, Bet } from '$lib/server/database';

export const settings = {
	public: settings_json.public,
	groupphase: settings_json.groupphase,
	panel1: settings_json.panel1,
	panel2: settings_json.panel2
};

export interface PanelData {
	teams: Team[] | null;
	match_history: Match[];
	match: Match | null;
	bet: Bet | null;
	groupphase: boolean;
}

let match_history: Match[] = [];
let teams: Team[] = [];

export function setupSettings(new_match_history: string, new_teams: string) {
	match_history = JSON.parse(new_match_history);
	teams = JSON.parse(new_teams);
}

export function setStatus(status: boolean) {
	settings.public = status;
	updateFile();
}

export function setGrouphase(phase: boolean) {
	settings.groupphase = phase;
	updateFile();
}

export function updatePanelTeams(new_teams: Team[], refresh = false) {
	if (!new_teams) return;
	teams = new_teams;
	updateFile();
	if (refresh) {
		refreshPanel('1');
		refreshPanel('2');
	}
}

export function updatePanelMatchHistory(new_match_history: Match[], refresh = false) {
	match_history = new_match_history;
	updateFile();
	if (refresh) {
		refreshPanel('1');
		refreshPanel('2');
	}
}

export function updatePanelMatch(panel_id: string, match: Match | null, refresh = false) {
	if (panel_id == '1') settings.panel1.match = match ? JSON.stringify(match) : '';
	else if (panel_id == '2') settings.panel2.match = match ? JSON.stringify(match) : '';
	updateFile();
	if (refresh) refreshPanel(panel_id);
}

export function updatePanelBet(panel_id: string, bet: Bet | null, refresh = false) {
	if (panel_id == '1') settings.panel1.bet = bet ? JSON.stringify(bet) : '';
	else if (panel_id == '2') settings.panel2.bet = bet ? JSON.stringify(bet) : '';
	updateFile();
	if (refresh) refreshPanel(panel_id);
}

function getJSONPanelData(panel_id: string) {
	return JSON.stringify(getPanelData(panel_id));
}

export function getPanelData(panel_id: string) {
	let data: PanelData;
	if (panel_id == '1') {
		data = {
			teams,
			match_history,
			bet: settings.panel1.bet ? JSON.parse(settings.panel1.bet) : null,
			match: settings.panel1.match ? JSON.parse(settings.panel1.match) : null,
			groupphase: settings.groupphase
		};
	} else if (panel_id == '2') {
		data = {
			teams,
			match_history,
			bet: settings.panel2.bet ? JSON.parse(settings.panel2.bet) : null,
			match: settings.panel2.match ? JSON.parse(settings.panel2.match) : null,
			groupphase: settings.groupphase
		};
	} else return null;
	return data;
}

export function refreshPanel(panel_id: string) {
	sendToPanel(panel_id, `update==${getJSONPanelData(panel_id)}`);
}

function updateFile() {
	writeFile(`${config.path}/src/lib/server/data/settings.json`, JSON.stringify(settings, null, 2), () => {});
}
