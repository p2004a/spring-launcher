'use strict';

const fs = require('fs').promises;
const path = require('path');
const { config } = require('./launcher_config');

const { DemoParser } = require('sdfz-demo-parser');

const REPLAY_CACHE_VERSION = 2;  // Increment when adding new fields etc

// Parse a replay and create the needed info structure. If there is a correct
// cache file for this replay, use it.
async function parseReplay(springPath, replayPath) {
	const fullReplayPath = path.join(springPath, replayPath);
	const demoCachePath = `${fullReplayPath}.cache`;
	try {
		// Check if there is a cache file and load it
		const info = JSON.parse(await fs.readFile(demoCachePath));
		if (info.replayCacheVersion !== REPLAY_CACHE_VERSION) {
			throw new Error('Cache file version mismatch');
		}
		return info;
	} catch (err) {
		// If there isn't, go parse the original replay, create the cache file,
		// and return the info.
		const parser = new DemoParser({
			skipPackets: config.replay_parser_skip_packets,
		});
		const demo = await parser.parseDemo(fullReplayPath);
		const info = {
			replayCacheVersion: REPLAY_CACHE_VERSION,
			relativePath: replayPath,
			engine: demo.header.versionString,
			game: demo.info.hostSettings.gametype,
			map: demo.info.hostSettings.mapname,
			players: demo.info.players.concat(demo.info.ais),
			gameTime: demo.header.gameTime,
			winningAllyTeamIds: demo.info.meta.winningAllyTeamIds,
		};

		// Since there is no cache file yet or it's stale, create it
		fs.writeFile(demoCachePath, JSON.stringify(info));
		return info;
	}
}

module.exports = {
	parseReplay: parseReplay
};
