import { PlayStationConsoleType, PlayStationConsole } from './PlayStationConsole';

export default class PlayStation3 extends PlayStationConsole
{
	public constructor()
	{
		super(PlayStationConsoleType.PS3, '830360909515980810'); // Bot SL-Projects
	}

	public get assetName() : string
	{
		return 'ps3_main';
	}

	public get consoleName() : string
	{
		return 'PlayStation 3';
	}
}