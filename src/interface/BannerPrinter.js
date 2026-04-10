"use strict";

import { TerminalLinkFormatter } from "../domain/utils/TerminalLinkFormatter.js";
import { Colorz } from "./Colorz.js";


export class BannerPrinter {
	
	static #BANNER = [
		".-. .-')      ('-.                 .-. .-')                             .-') _  .-. .-')   ",
		"\\  ( OO )    ( OO ).-.             \\  ( OO )                           ( OO ) ) \\  ( OO )  ",
		" ;-----.\\    / . --. /    .-----.  ,--. ,--.   ,--.        ,-.-')  ,--./ ,--,'  ,--. ,--.  ",
		" | .-.  |    | \\-.  \\    '  .--./  |  .'   /   |  |.-')    |  |OO) |   \\ |  |\\  |  .'   /  ",
		" | '-' /_) .-'-'  |  |   |  |('-.  |      /,   |  | OO )   |  |  \\ |    \\|  | ) |      /,  ",
		" | .-. `.   \\| |_.'  |  /_) |OO  ) |     ' _)  |  |`-' |   |  |(_/ |  .     |/  |     ' _) ",
		" | |  \\  |   |  .-.  |  ||  |`-'|  |  .   \\   (|  '---.'  ,|  |_.' |  |\\    |   |  .   \\   ",
		" | '--'  /   |  | |  | (_'  '--'\\  |  |\\   \\   |      |  (_|  |    |  | \\   |   |  |\\   \\  ",
		" `------'    `--' `--'    `-----'  `--' '--'   `------'    `--'    `--'  `--'   `--' '--'  ",
	].join("\n");
	
	
	constructor() {};
	
	static printBanner() {
		const terminalLinkFormatter = new TerminalLinkFormatter();
		const profileLink = terminalLinkFormatter.formatConsoleLink({
			url: "https://github.com/ju8z",
		});
		
		console.log(`${ Colorz.LIGHT_BLUE }${ BannerPrinter.#BANNER }${ Colorz.RESET }`);
		console.log(` by Ju8z - ${ profileLink }`);
	}
}
