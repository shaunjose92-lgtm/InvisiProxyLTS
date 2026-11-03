import {
	Keywords,
	Inline,
	route,
	sites,
	Splash,
	values,
	translate,
	titled,
} from '../document-helpers.tsx';
import {
	ParticlesScript,
	TooltipScripts,
	ScramjetScripts,
	RegisterServiceWorkerScript,
	PageScripts,
	PageDescription,
} from '../components/HeadScripts.tsx';
import HeadContent from '../components/HeadContent.tsx';
import ProxyPreloads from '../components/ProxyPreloads.tsx';
import AntiExfil from '../components/AntiExfil.tsx';
import Header from '../components/Header.tsx';
import ProxySettings from '../components/ProxySettings.tsx';
import Footer from '../components/Footer.tsx';
import Placements from '../components/Placements.tsx';
import App from '../components/AppButton.tsx';

export default function Scramjet() {
	return (
		<>
			<Keywords />
			<AntiExfil />
			<div id="header" class="fullwidth">
				<Header />
			</div>
			{values.showSplash && (
				<div id="banner" class="fullwidth">
					<p class="text-center">
						<Splash />
					</p>
				</div>
			)}
			<div id="background" class="fullwidth"></div>
			<Keywords />
			<div data-aos="fade-right" class="hero-grid-container">
				<div class="box-hero">
					<div class="hero-content browse-hero">
						<div class="browse-brand cipher-browse-brand">
							<div class="cipher-browse-eyebrow"><span class="cipher-online-dot"></span> CIPHER / BROWSER</div>
							<div class="cipher-browse-symbol">C</div>
							<h1 class="cipher-browse-heading">Your next tab starts here.</h1>
							<p class="cipher-browse-description">Search, explore and pick up where you left off. The web, in Cipher.</p>
						</div>
						<div class="proxy-form text-center">
							<div id="pr-sj" class="pr-form">
								<select
									id="search-engine"
									name="search-engine"
									aria-label={translate(
										'settings.browsing.searchEngine'
									)}
									class="pr-button glowbutton search-engine-list"
								>
									{[
										values.labels.Startpage,
										values.labels.Brave,
										values.labels.Google,
										values.labels.Bing,
										values.labels.DuckDuckGo,
									].map((engine) => (
										<option
											value={engine}
											selected={
												engine === values.defaultSearch
											}
										>
											{engine}
										</option>
									))}
								</select>
								<div class="search-box">
									<input
										type="text"
										spellcheck="false"
										autocomplete="off"
										placeholder={translate(
											'scramjet.searchPlaceholder'
										)}
										id="search-input"
									/>
									<ul id="autocomplete"></ul>
								</div>
								<button
									type="button"
									class="pr-button glowbutton pr-go2 link-button"
									id="search-btn"
								>
									{translate('scramjet.search')}
								</button>
							</div>
							<div class="cipher-quicklinks-label">QUICK ACCESS <span>·</span> POPULAR DESTINATIONS</div>
							<div class="glist browse-presets">
								{sites.map((site) => (
									<App url={site.url} name={site.name} />
								))}
							</div>
							<div class="cipher-proxy-pref"><ProxySettings /></div>
							<p class="cipher-browser-reminder">Some websites, social-media sign-ins and Google authentication may not work through a proxy. Browser settings and site data are stored on this device.</p>
						</div>
					</div>
				</div>
			</div>
			<Placements />
			<div id="footer" class="fullwidth">
				<Footer />
			</div>
			<Keywords />
			<Inline>
				<script src={route('assets/js/card.js', 'inline')} />
			</Inline>
		</>
	);
}

export function Head() {
	return (
		<>
			<title>
				{titled(
					`Cipher Browser | ${translate('scramjet.pageTitle')}`,
					translate('header.browse.label')
				)}
			</title>
			<PageDescription content={translate('scramjet.description')} />
			<ProxyPreloads />
			<HeadContent />
			<ScramjetScripts utilities />
			<RegisterServiceWorkerScript />
			<ParticlesScript />
			<TooltipScripts />
			<PageScripts />
		</>
	);
}
