let discordClient : any;

import { dialog, ipcMain } from 'electron';
import log = require('electron-log');
import { IDiscordPresenceModel, IDiscordPresenceUpdateOptions } from './Model/DiscordPresenceModel';
import { PlayStationConsole } from './Consoles/PlayStationConsole';
import appEvent from './Events';

const packageJson = require('../package.json');
const isDev = process.env.NODE_ENV === 'dev';

interface IDiscordPresenceDefaultDataModel
{
  	instance : boolean;
	largeImageKey : string;
	largeImageText : string;
  	smallImageKey : string;
  	smallImageText : string;
}

export class DiscordController
{
	private _currentConsole : PlayStationConsole;
	private _running : boolean = false;
	private _lastStartTimestamp : number;

	// Most of these properties get replaced in the constructor for the respective console.
	private _defaultInfo : IDiscordPresenceDefaultDataModel =  {
		instance: true,
		largeImageKey: 'ps4_main',
		largeImageText: 'PlayStation 4',
		smallImageKey: 'ps4_main',
		smallImageText: 'PlayStationDiscord ' + (packageJson.version || '')
	};

	constructor(console: PlayStationConsole)
	{
		this._currentConsole = console;

		discordClient = require('discord-rich-presence')(console.clientId);

		this._defaultInfo.largeImageKey = console.assetName;
		this._defaultInfo.largeImageText = console.consoleName;
		this._defaultInfo.smallImageKey = console.assetName;

		this._running = true;

		discordClient.on('error', (err: any) => {
			if (err == null) {
				log.error('An error occurred while communicating with Discord. Maybe the application n°' + console.clientId + ' for the ' + console.consoleName + ' has been deleted?');
			} else {
				log.error('An error occurred while communicating with Discord', err);
			}

			dialog.showMessageBox(null, {
				type: 'error',
				title: 'PlayStationDiscord Error',
				message: 'An error occurred while communicating with Discord',
				detail: 'Maybe the application n°' + console.clientId + ' for the ' + console.consoleName + ' has been deleted? \n\nPlease check the log file for additonal information. \n(Windows) %appdata%\\playstationdiscord\\log.log',
			});

			appEvent.emit('discord-disconnected', err);

			this._running = false;
		});

		log.info('DiscordController init');
	}

	public restart() : void
	{
		this.stop();
		discordClient = new DiscordController(this._currentConsole);
	}

	public running() : boolean
	{
		return this._running;
	}

	public stop() : void
	{
		discordClient.disconnect();
		this._running = false;
	}

	public update(data: IDiscordPresenceModel, options?: IDiscordPresenceUpdateOptions) : Promise<void>
	{
		return new Promise((resolve, reject) => {
			if (!this.running())
			{
				reject('Discord controller not running');
			}
			else
			{
				const usingOptions = options !== undefined;

				if (!usingOptions || !options.hideTimestamp)
				{
					if (data.startTimestamp === undefined)
					{
						data.startTimestamp = this._lastStartTimestamp;
					}
					else
					{
						this._lastStartTimestamp = data.startTimestamp;
					}
				}

				if (isDev) {
					log.info(data);
				}
				discordClient.updatePresence({...this._defaultInfo, ...data});
				resolve();
			}
		});
	}
}